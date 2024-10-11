/* eslint-disable prettier-vue/prettier */
import type { ConnectionType } from '.'
import type ClientHandler from './ClientHandler'
import type { SubscriptionType } from './ClientHandler'

export default class ClientConnectionManager {
  private static instance: ClientConnectionManager | null = null

  private clients: Map<string, ClientHandler> = new Map()
  private tradeClients: Map<string, ClientHandler> = new Map()
  private tickerClients: Map<string, ClientHandler> = new Map()
  private clientsByType: Map<string, Set<ClientHandler>> = new Map()

  static getInstance(): ClientConnectionManager {
    if (!this.instance) {
      this.instance = new ClientConnectionManager()
    }
    return this.instance
  }

  // Get a ClientHandler for a specific user id
  getClient(id: string): ClientHandler | undefined {
    return this.clients.get(id)
  }

  // Add a new ClientHandler for a specific user id
  addClient(id: string, client: ClientHandler): void {
    if (client.connectionState !== 'OPEN') {
      console.warn(`WebSocket is not open for client ${id}. Retrying...`)
      setTimeout(() => this.addClient(id, client), 100) // Retry after 100ms
      return
    }

    this.clients.set(id, client)

    if (client.connectionType === 'trade') {
      this.tradeClients.set(id, client)
    } else if (client.connectionType === 'tickers') {
      this.tickerClients.set(id, client)
    }
  }

  removeClient(id: string): void {
    const client = this.clients.get(id)
    if (!client) {
      return
    }

    // Close the WebSocket, regardless of its state
    client.close()

    // Remove from all maps
    this.clients.delete(id)
    if (client.connectionType === 'trade') {
      this.tradeClients.delete(id)
    } else if (client.connectionType === 'tickers') {
      this.tickerClients.delete(id)
    }
  }

  // Check if the client connection for a specific user id is open
  isClientActive(id: string): boolean {
    const client = this.clients.get(id)
    return client !== undefined && client.connectionState === 'OPEN'
  }

  getClientsSubscribedTo(
    symbol: string,
    type: ConnectionType,
  ): ClientHandler[] {
    const clientsSubscribedToSymbol: ClientHandler[] = []
    for (const clientHandler of this.clients.values()) {
      if (
        clientHandler.subscriptions[type] &&
        clientHandler.subscriptions[type].has(symbol)
      ) {
        clientsSubscribedToSymbol.push(clientHandler)
      }
    }
    return clientsSubscribedToSymbol
  }

  isSymbolSubscribedByOtherClients(
    id: number,
    symbol: string,
    type: SubscriptionType,
  ): boolean {
    for (const [clientId, clientHandler] of this.clients) {
      if (clientId !== id.toString()) {
        if (
          clientHandler.subscriptions[type] &&
          clientHandler.subscriptions[type].has(symbol)
        ) {
          return true
        }
      }
    }
    return false
  }

  getAllClients(): ClientHandler[] {
    return Array.from(this.clients.values()).filter(
      (clientHandler) => clientHandler.ws.readyState === WebSocket.OPEN,
    )
  }

  getClientsOfType(type: ConnectionType): ClientHandler[] {
    if (type === 'trade') {
      return Array.from(this.tradeClients.values())
    } else if (type === 'tickers') {
      return Array.from(this.tickerClients.values())
    } else {
      return []
    }
  }

  // Add a new ClientHandler for a specific type
  addClientOfType(type, client) {
    if (!this.clientsByType.has(type)) {
      this.clientsByType.set(type, new Set())
    }
    this.clientsByType.get(type).add(client)
  }

  removeClientOfType(type, client) {
    if (type === 'tickers') {
      this.tickerClients.delete(client.id)
    } else if (type === 'trade') {
      this.tradeClients.delete(client.id)
    }
  }
}
