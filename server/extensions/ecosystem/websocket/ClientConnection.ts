import { extractParamsFromIdentifier } from '../utils/websocket'
import type ClientHandler from './ClientHandler'
import type { SubscriptionType } from './ClientHandler'

export default class ClientConnection {
  private static instance: ClientConnection | null = null
  private clients: Map<string, ClientHandler> = new Map()

  static getInstance(): ClientConnection {
    if (!this.instance) {
      this.instance = new ClientConnection()
    }
    return this.instance
  }

  getClient(id: string): ClientHandler | undefined {
    return this.clients.get(id)
  }

  async addClient(id: string, client: any, retryCount = 0): Promise<void> {
    if (client.connectionState !== 'OPEN') {
      if (retryCount < 3) {
        setTimeout(() => this.addClient(id, client, retryCount + 1), 100)
      }
      return
    }
    this.clients.set(id, client)
  }

  async removeClient(id: string): Promise<void> {
    const client = this.getClient(id)
    if (client) {
      await client.handleClientDisconnection()
      this.clients.delete(id)
    }
  }

  async getAllClients(): Promise<any[]> {
    const openClients: ClientHandler[] = []
    this.clients.forEach((clientHandler, clientId) => {
      if (clientHandler.connectionState === 'OPEN') {
        openClients.push(clientHandler)
      } else {
        this.removeClient(clientId)
      }
    })

    return openClients
  }

  async getClientsBySubscriptionType(type: string): Promise<string[]> {
    const interestedClients: string[] = []

    // Fetch all subscriptions concurrently for all clients
    const allClientsSubscriptions = await Promise.all(
      Array.from(this.clients.entries()).map(async ([clientId, client]) => {
        const subscriptions = await client.getAllSubscriptionsForClient(type)
        return { clientId, subscriptions }
      }),
    )

    // Filter out the clients who are interested in the given type
    for (const { clientId, subscriptions } of allClientsSubscriptions) {
      if (subscriptions.some((sub) => sub.type === type)) {
        interestedClients.push(clientId)
      }
    }

    return interestedClients
  }

  async isAddressSubscribedByOtherClients(
    id: number,
    targetAddress: string,
  ): Promise<boolean> {
    for (const [clientId, client] of this.clients.entries()) {
      if (parseInt(clientId) !== id) {
        const subscriptions =
          await client.getAllSubscriptionsForClient('watchDeposits')
        if (
          subscriptions.some((sub) => {
            if (
              sub.params &&
              typeof sub.params === 'object' &&
              'address' in sub.params
            ) {
              const { address } = sub.params
              return address === targetAddress
            }
            return false
          })
        ) {
          return true
        }
      }
    }
    return false
  }

  public async getInterestedClients(
    type: SubscriptionType,
    identifier: string,
  ): Promise<ClientHandler[]> {
    const allClients = await this.getAllClients()

    const interestedClients = await Promise.all(
      allClients.map(async (client) => {
        const params = extractParamsFromIdentifier(type, identifier)
        const subscription = await client.getSubscription(type, params)
        return subscription.isActive ? client : null
      }),
    )

    return interestedClients.filter(
      (client) => client !== null,
    ) as ClientHandler[]
  }

  public async checkSubscriptions(): Promise<void> {
    const chainsWithSubscribers = new Set<string>()
    const allClients = await this.getAllClients()
    for (const client of allClients) {
      const subscriptions =
        await client.getAllSubscriptionsForClient('watchDeposits')
      for (const { type, params } of subscriptions) {
        if (params && typeof params === 'object' && 'chain' in params) {
          const { chain } = params
          chainsWithSubscribers.add(chain)
        } else {
          console.error(`Unexpected params format for type ${type}: `, params)
        }
      }
    }
  }

  public async getInterestedClientsByUserId(
    id: string,
  ): Promise<ClientHandler[]> {
    const allClients = await this.getAllClients()
    const interestedClients = await Promise.all(
      allClients.map(async (client) => {
        const subscription = await client.getSubscription('watchOrders', {
          id,
        })
        return subscription.isActive ? client : null
      }),
    )
    return interestedClients.filter(
      (client) => client !== null,
    ) as ClientHandler[]
  }
}
