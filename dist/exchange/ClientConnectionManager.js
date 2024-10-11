"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientConnectionManager {
    static instance = null;
    clients = new Map();
    tradeClients = new Map();
    tickerClients = new Map();
    clientsByType = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new ClientConnectionManager();
        }
        return this.instance;
    }
    // Get a ClientHandler for a specific user id
    getClient(id) {
        return this.clients.get(id);
    }
    // Add a new ClientHandler for a specific user id
    addClient(id, client) {
        if (client.connectionState !== 'OPEN') {
            console.warn(`WebSocket is not open for client ${id}. Retrying...`);
            setTimeout(() => this.addClient(id, client), 100); // Retry after 100ms
            return;
        }
        this.clients.set(id, client);
        if (client.connectionType === 'trade') {
            this.tradeClients.set(id, client);
        }
        else if (client.connectionType === 'tickers') {
            this.tickerClients.set(id, client);
        }
    }
    removeClient(id) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        // Close the WebSocket, regardless of its state
        client.close();
        // Remove from all maps
        this.clients.delete(id);
        if (client.connectionType === 'trade') {
            this.tradeClients.delete(id);
        }
        else if (client.connectionType === 'tickers') {
            this.tickerClients.delete(id);
        }
    }
    // Check if the client connection for a specific user id is open
    isClientActive(id) {
        const client = this.clients.get(id);
        return client !== undefined && client.connectionState === 'OPEN';
    }
    getClientsSubscribedTo(symbol, type) {
        const clientsSubscribedToSymbol = [];
        for (const clientHandler of this.clients.values()) {
            if (clientHandler.subscriptions[type] &&
                clientHandler.subscriptions[type].has(symbol)) {
                clientsSubscribedToSymbol.push(clientHandler);
            }
        }
        return clientsSubscribedToSymbol;
    }
    isSymbolSubscribedByOtherClients(id, symbol, type) {
        for (const [clientId, clientHandler] of this.clients) {
            if (clientId !== id.toString()) {
                if (clientHandler.subscriptions[type] &&
                    clientHandler.subscriptions[type].has(symbol)) {
                    return true;
                }
            }
        }
        return false;
    }
    getAllClients() {
        return Array.from(this.clients.values()).filter((clientHandler) => clientHandler.ws.readyState === WebSocket.OPEN);
    }
    getClientsOfType(type) {
        if (type === 'trade') {
            return Array.from(this.tradeClients.values());
        }
        else if (type === 'tickers') {
            return Array.from(this.tickerClients.values());
        }
        else {
            return [];
        }
    }
    // Add a new ClientHandler for a specific type
    addClientOfType(type, client) {
        if (!this.clientsByType.has(type)) {
            this.clientsByType.set(type, new Set());
        }
        this.clientsByType.get(type).add(client);
    }
    removeClientOfType(type, client) {
        if (type === 'tickers') {
            this.tickerClients.delete(client.id);
        }
        else if (type === 'trade') {
            this.tradeClients.delete(client.id);
        }
    }
}
exports.default = ClientConnectionManager;
