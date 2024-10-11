// clientHandler.ts

import { promisify } from 'util'
import type { EcosystemTokenContractType } from '~~/types'
import { redis } from '../../../utils/redis'
import { getLatestCandles, getOrderBook } from '../utils/scylla/queries'
import { cancelWatchAddress } from '../utils/utxo'
import {
  extractParamsFromIdentifier,
  generateIdentifier,
} from '../utils/websocket'
import type ClientConnection from './ClientConnection'
import type DataManager from './DataManager'

export type SubscriptionType =
  | 'watchDeposits'
  | 'watchTickers'
  | 'watchTicker'
  | 'watchOrderBook'
  | 'watchCandles'
  | 'watchOrders'

const endpointMap: Record<string, SubscriptionType> = {
  deposits: 'watchDeposits',
  tickers: 'watchTickers',
  ticker: 'watchTicker',
  orderbook: 'watchOrderBook',
  candles: 'watchCandles',
  orders: 'watchOrders',
}

interface SubscriptionHandler {
  subscribe: (params: any) => Promise<any>
  unsubscribe: (params: any) => void
}

export default class ClientHandler {
  endpoint: string
  id: number
  ws: any
  clientConnection: ClientConnection
  dataManager: DataManager
  connectionState: 'OPEN' | 'CLOSED' = 'CLOSED'
  private hgetAsync = promisify(redis.hget).bind(redis)
  private hsetAsync = promisify(redis.hset).bind(redis)
  private hdelAsync = promisify(redis.hdel).bind(redis)
  private hkeysAsync = promisify(redis.hkeys).bind(redis)

  constructor(
    id: number,
    clientConnection: ClientConnection,
    dataManager: DataManager,
    endpoint: string,
  ) {
    this.id = id
    this.clientConnection = clientConnection
    this.dataManager = dataManager
    this.endpoint = endpoint
  }

  public initialize(ws: any): void {
    if (!ws) {
      return
    }
    this.ws = ws
    this.connectionState = 'OPEN'
  }

  handleClientMessage(message: ArrayBuffer): void {
    try {
      const messageStr = Buffer.from(message).toString()
      const { method, params } = JSON.parse(messageStr) as {
        method: string
        params: any
      }

      const type = this.endpoint === 'exchange' ? params.method : this.endpoint

      this.handleSubscription(method, endpointMap[type], params)
    } catch (error) {
      console.error('Error in handleClientMessage:', error)
      console.error(error.stack)
    }
  }

  private subscriptionHandlers: Record<SubscriptionType, SubscriptionHandler> =
    {
      watchDeposits: {
        subscribe: async (params: {
          chain: string
          address: string
          uuid: string
          currency: string
          ct: EcosystemTokenContractType
        }) => {
          const { chain, address, uuid, currency, ct } = params
          this.addSubscription('watchDeposits', params)
          this.dataManager.watchDeposits(chain, address, uuid, currency, ct)
          return `Subscribed to ${address} deposits successfully.`
        },
        unsubscribe: (params: {
          chain: string
          address: string
          uuid: string
          currency: string
          ct: EcosystemTokenContractType
        }) => {
          this.removeSubscription('watchDeposits', params)
          console.log('Unsubscribing from deposits')

          if (['BTC', 'LTC', 'DOGE'].includes(params.chain)) {
            console.log('Cancelling watch address')
            cancelWatchAddress(params.chain, params.address)
          }
          return `Unsubscribed from ${params.address} deposits successfully.`
        },
      },
      watchTickers: {
        subscribe: async (params: { symbols: string[] }) => {
          this.addSubscription('watchTickers', 'all')
          const tickers = await getLatestCandles()
          return {
            message: `Subscribed to tickers successfully.`,
            type: 'tickers',
            result: tickers,
          }
        },
        unsubscribe: (params: { symbols: string[] }) => {
          this.removeSubscription('watchTickers', params)
          return `Unsubscribed from tickers successfully.`
        },
      },
      watchTicker: {
        subscribe: async (params: { symbol: string }) => {
          this.addSubscription('watchTicker', params)
          return `Subscribed to ${params.symbol} ticker successfully.`
        },
        unsubscribe: (params: { symbol: string }) => {
          this.removeSubscription('watchTicker', params)
          return `Unsubscribed from ${params.symbol} ticker successfully.`
        },
      },
      watchOrderBook: {
        subscribe: async (params: { symbol: string; limit: number }) => {
          const { symbol, limit } = params

          try {
            const updatedOrderBook = await getOrderBook(symbol)

            // Add the subscription
            this.addSubscription('watchOrderBook', { symbol, limit })

            // Return the latest bids and asks
            return {
              message: `Subscribed to ${symbol} order book successfully.`,
              type: 'orderbook',
              result: updatedOrderBook,
            }
          } catch (error) {
            console.error(
              `Failed to fetch order book for symbol ${symbol}: ${error}`,
            )
          }
        },
        unsubscribe: (_params: any) => {
          this.removeSubscription('watchOrderBook', _params)
          return `Unsubscribed from ${_params.symbol} order book successfully.`
        },
      },

      watchCandles: {
        subscribe: async (params: { symbol: string; interval: string }) => {
          const { symbol, interval } = params
          this.addSubscription('watchCandles', { symbol, interval })
          return `Subscribed to ${interval} ${symbol} candles successfully.`
        },
        unsubscribe: (_params: any) => {
          this.removeSubscription('watchCandles', _params)
          return `Unsubscribed from ${_params.interval} ${_params.symbol} candles successfully.`
        },
      },
      watchOrders: {
        subscribe: async (params: { id: string }) => {
          this.addSubscription('watchOrders', params)
          return `Subscribed to orders successfully.`
        },
        unsubscribe: (params: { id: string }) => {
          this.removeSubscription('watchOrders', params)
          return `Unsubscribed from orders successfully.`
        },
      },
    }

  private handleSubscription(
    method: string,
    type: SubscriptionType,
    params: any,
  ) {
    if (this.subscriptionHandlers[type]) {
      if (method === 'SUBSCRIBE') {
        this.subscriptionHandlers[type]
          .subscribe(params)
          .then((data) => {
            this.sendToClient({ status: 'subscribed', data })
          })
          .catch((err) => {
            this.sendToClient({ status: 'error', message: err.message })
          })
      } else if (method === 'UNSUBSCRIBE') {
        this.subscriptionHandlers[type].unsubscribe(params)
        this.sendToClient({ status: 'unsubscribed', data: params })
      }
    } else {
      console.error(`Subscription handler for type ${type} does not exist.`)
    }
  }

  async addSubscription(type: SubscriptionType, params: any) {
    const identifier = generateIdentifier(type, params)
    const existingData = await this.hgetAsync(
      `subscription:${type}`,
      identifier,
    )
    const subscribers = existingData ? JSON.parse(existingData) : []
    if (!subscribers.includes(this.id)) {
      subscribers.push(this.id)
    }
    await this.hsetAsync(
      `subscription:${type}`,
      identifier,
      JSON.stringify(subscribers),
    )
  }

  async getSubscription(type: SubscriptionType, params: any) {
    try {
      if (!type || !params) {
        return { isActive: false, params: {} }
      }

      const identifier = generateIdentifier(type, params)

      const existingData = await this.hgetAsync(
        `subscription:${type}`,
        identifier,
      )

      if (existingData) {
        const subscribers = JSON.parse(existingData)
        const isSubscribed = subscribers.includes(this.id)
        return { isActive: isSubscribed, params: params }
      }
      return { isActive: false, params: {} }
    } catch (error) {
      console.error('Error in getSubscription:', error)
      return { isActive: false, params: {} }
    }
  }

  async removeSubscription(type: SubscriptionType, params: any) {
    const identifier = generateIdentifier(type, params)
    const existingData = await this.hgetAsync(
      `subscription:${type}`,
      identifier,
    )
    if (existingData) {
      const subscribers = JSON.parse(existingData)
      const updatedSubscribers = subscribers.filter(
        (id: number) => id !== this.id,
      )
      if (updatedSubscribers.length > 0) {
        await this.hsetAsync(
          `subscription:${type}`,
          identifier,
          JSON.stringify(updatedSubscribers),
        )
      } else {
        await this.hdelAsync(`subscription:${type}`, identifier)
      }
    }
  }

  async getAllSubscriptionTypes(): Promise<SubscriptionType[]> {
    // You can directly return an array of types if you already know them.
    return [
      'watchDeposits',
      'watchTickers',
      'watchTicker',
      'watchOrderBook',
      'watchCandles',
      'watchOrders',
    ]
  }

  public async getAllSubscriptionsForClient(type?: string) {
    try {
      let allTypes = await this.getAllSubscriptionTypes()
      if (type) {
        allTypes = allTypes.filter((t) => t === type)
      }
      const allSubscriptionsPromises = []

      for (const type of allTypes) {
        const identifiers = await this.hkeysAsync(`subscription:${type}`)

        const typeSubscriptionsPromises = identifiers.map(
          async (identifier) => {
            const params = extractParamsFromIdentifier(type, identifier)
            const subscription = await this.getSubscription(type, params)
            if (subscription.isActive) {
              return { type, params: subscription.params }
            }
            return null
          },
        )

        allSubscriptionsPromises.push(...typeSubscriptionsPromises)
      }

      const allSubscriptions = await Promise.all(allSubscriptionsPromises)
      const filteredSubscriptions = allSubscriptions.filter(
        (sub) => sub !== null,
      )

      this.removeUnusedProviders(filteredSubscriptions)
      return filteredSubscriptions
    } catch (error) {
      console.error('Error fetching all subscriptions:', error)
      return []
    }
  }

  private async removeUnusedProviders(subscriptions: any[]) {
    const watchDepositsSubscriptions = subscriptions.filter(
      (sub) => sub.type === 'watchDeposits',
    )
    const activeChains = new Set(
      watchDepositsSubscriptions.map((sub) => sub.params && sub.params.chain),
    )

    for (const chain of this.dataManager.chainProviders.keys()) {
      if (!activeChains.has(chain)) {
        this.dataManager.removeUnusedChainProviders(chain)
      }
    }
  }

  async removeAllSubscriptions() {
    try {
      const subscriptions = await this.getAllSubscriptionsForClient()
      const removePromises = subscriptions.map(({ type, params }) => {
        return this.removeSubscription(type, params)
      })

      await Promise.all(removePromises)
    } catch (error) {
      console.error('Error removing all subscriptions:', error)
    }
  }

  handleClientDisconnection() {
    this.removeAllSubscriptions()
      .then(() => {
        this.clientConnection.removeClient(this.id.toString())
        this.connectionState = 'CLOSED'
      })
      .catch((err) => {
        // Handle error (logging, etc.)
      })
  }

  sendToClient(data: any) {
    try {
      if (this.ws && this.connectionState === 'OPEN') {
        this.ws.send(JSON.stringify(data))
      } else {
        this.clientConnection.removeClient(this.id.toString())
      }
    } catch (error) {}
  }
}
