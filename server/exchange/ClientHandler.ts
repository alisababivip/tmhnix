/* eslint-disable prettier-vue/prettier */
import type { ConnectionType } from '.'
import type ClientConnectionManager from './ClientConnectionManager'
import type ExchangeConnectionManager from './ExchangeConnectionManager'

export type SubscriptionType =
  | 'watchOHLCV'
  | 'watchOrderBook'
  | 'watchTicker'
  | 'watchTrades'

interface Subscriptions {
  watchOHLCV: Set<string>
  watchOrderBook: Set<string>
  watchTicker: Set<string>
  watchTrades: Set<string>
}

interface MessageParams {
  symbol: string
  type: SubscriptionType
  interval?: string
  limit?: number
  since?: number
  param?: any
}

export default class ClientHandler {
  id: number
  ws: any
  subscriptions: Subscriptions
  clientConnectionManager: ClientConnectionManager
  ExchangeConnectionManager: ExchangeConnectionManager
  connectionType: ConnectionType
  connectionState: 'OPEN' | 'CLOSED' = 'CLOSED'

  constructor(
    id: number,
    clientConnectionManager: ClientConnectionManager,
    ExchangeConnectionManager: ExchangeConnectionManager,
    connectionType: ConnectionType,
  ) {
    this.id = id
    this.subscriptions = {
      watchOHLCV: new Set(),
      watchOrderBook: new Set(),
      watchTicker: new Set(),
      watchTrades: new Set(),
    }
    this.clientConnectionManager = clientConnectionManager
    this.ExchangeConnectionManager = ExchangeConnectionManager
    this.connectionType = connectionType
  }

  public initialize(ws: any): void {
    if (!ws) {
      return
    }
    this.ws = ws
    this.connectionState = 'OPEN' // Set the state to OPEN here
  }

  handleClientMessage(message: ArrayBuffer): void {
    const messageStr = Buffer.from(message).toString()
    const { method, params } = JSON.parse(messageStr) as {
      method: string
      params: MessageParams
    }

    if (this.connectionType === 'trade') {
      if (!params) {
        return
      }

      const { symbol, type, interval, limit, param } = params

      // Validate the type
      const validTypes: SubscriptionType[] = [
        'watchOHLCV',
        'watchOrderBook',
        'watchTicker',
        'watchTrades',
      ]
      if (!validTypes.includes(type)) {
        console.error(`Invalid type: ${type}`)
        return
      }
      if (method === 'SUBSCRIBE') {
        const identifier =
          type === 'watchOHLCV' ? `${symbol}-${interval}` : symbol
        this.subscriptions[type].add(identifier)

        try {
          this.ExchangeConnectionManager.watchData(
            symbol,
            type,
            interval,
            limit,
            param,
          )

          this.sendToClient({
            status: 'subscribed',
            symbol,
            type,
            interval,
            limit,
          })
        } catch (error) {
          this.sendToClient({ status: 'error', message: error.message })
        }
      } else if (method === 'UNSUBSCRIBE') {
        const identifier =
          type === 'watchOHLCV' ? `${symbol}-${interval}` : symbol
        this.subscriptions[type].delete(identifier)

        if (
          !this.clientConnectionManager.isSymbolSubscribedByOtherClients(
            this.id,
            symbol,
            type as SubscriptionType,
          )
        ) {
          this.ExchangeConnectionManager.removeSubscription(identifier, type)
          this.sendToClient({ status: 'unsubscribed', symbol, type })
        }
      }
    } else if (this.connectionType === 'tickers') {
      if (method === 'SUBSCRIBE') {
        this.clientConnectionManager.addClientOfType('tickers', this)
        this.sendToClient({ status: 'subscribed', type: 'tickers' })
      } else if (method === 'UNSUBSCRIBE') {
        this.clientConnectionManager.removeClientOfType('tickers', this)
        this.sendToClient({ status: 'unsubscribed', type: 'tickers' })
      }
    }
  }

  // Handle a disconnection from the client
  handleClientDisconnection() {
    // For each symbol in the subscriptions set, unsubscribe from data if necessary
    for (const type in this.subscriptions) {
      for (const symbol of this.subscriptions[type]) {
        if (
          !this.clientConnectionManager.isSymbolSubscribedByOtherClients(
            this.id,
            symbol,
            type as SubscriptionType,
          )
        ) {
          this.ExchangeConnectionManager.removeSubscription(symbol, type)
        }
      }
    }

    // Remove this client from the ClientConnectionManager
    this.clientConnectionManager.removeClient(this.id.toString())
    this.connectionState = 'CLOSED'
  }

  sendToClient(data: any) {
    try {
      if (this.ws && this.connectionState === 'OPEN') {
        this.ws.send(JSON.stringify(data))
      } else {
        this.clientConnectionManager.removeClient(this.id.toString())
      }
    } catch (error) {
      // Handle error
    }
  }

  // Close the client connection
  close() {
    try {
      if (this.ws && this.ws.readyState === this.ws.OPEN) {
        this.ws.close()
      }
    } catch (error) {}

    // Clear the subscriptions set
    this.subscriptions = {
      watchOHLCV: new Set(),
      watchOrderBook: new Set(),
      watchTicker: new Set(),
      watchTrades: new Set(),
    }
  }
}
