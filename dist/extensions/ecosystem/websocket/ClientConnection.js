"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("../utils/websocket");
class ClientConnection {
    static instance = null;
    clients = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new ClientConnection();
        }
        return this.instance;
    }
    getClient(id) {
        return this.clients.get(id);
    }
    async addClient(id, client, retryCount = 0) {
        if (client.connectionState !== 'OPEN') {
            if (retryCount < 3) {
                setTimeout(() => this.addClient(id, client, retryCount + 1), 100);
            }
            return;
        }
        this.clients.set(id, client);
    }
    async removeClient(id) {
        const client = this.getClient(id);
        if (client) {
            await client.handleClientDisconnection();
            this.clients.delete(id);
        }
    }
    async getAllClients() {
        const openClients = [];
        this.clients.forEach((clientHandler, clientId) => {
            if (clientHandler.connectionState === 'OPEN') {
                openClients.push(clientHandler);
            }
            else {
                this.removeClient(clientId);
            }
        });
        return openClients;
    }
    async getClientsBySubscriptionType(type) {
        const interestedClients = [];
        // Fetch all subscriptions concurrently for all clients
        const allClientsSubscriptions = await Promise.all(Array.from(this.clients.entries()).map(async ([clientId, client]) => {
            const subscriptions = await client.getAllSubscriptionsForClient(type);
            return { clientId, subscriptions };
        }));
        // Filter out the clients who are interested in the given type
        for (const { clientId, subscriptions } of allClientsSubscriptions) {
            if (subscriptions.some((sub) => sub.type === type)) {
                interestedClients.push(clientId);
            }
        }
        return interestedClients;
    }
    async isAddressSubscribedByOtherClients(id, targetAddress) {
        for (const [clientId, client] of this.clients.entries()) {
            if (parseInt(clientId) !== id) {
                const subscriptions = await client.getAllSubscriptionsForClient('watchDeposits');
                if (subscriptions.some((sub) => {
                    if (sub.params &&
                        typeof sub.params === 'object' &&
                        'address' in sub.params) {
                        const { address } = sub.params;
                        return address === targetAddress;
                    }
                    return false;
                })) {
                    return true;
                }
            }
        }
        return false;
    }
    async getInterestedClients(type, identifier) {
        const allClients = await this.getAllClients();
        const interestedClients = await Promise.all(allClients.map(async (client) => {
            const params = (0, websocket_1.extractParamsFromIdentifier)(type, identifier);
            const subscription = await client.getSubscription(type, params);
            return subscription.isActive ? client : null;
        }));
        return interestedClients.filter((client) => client !== null);
    }
    async checkSubscriptions() {
        const chainsWithSubscribers = new Set();
        const allClients = await this.getAllClients();
        for (const client of allClients) {
            const subscriptions = await client.getAllSubscriptionsForClient('watchDeposits');
            for (const { type, params } of subscriptions) {
                if (params && typeof params === 'object' && 'chain' in params) {
                    const { chain } = params;
                    chainsWithSubscribers.add(chain);
                }
                else {
                    console.error(`Unexpected params format for type ${type}: `, params);
                }
            }
        }
    }
    async getInterestedClientsByUserId(id) {
        const allClients = await this.getAllClients();
        const interestedClients = await Promise.all(allClients.map(async (client) => {
            const subscription = await client.getSubscription('watchOrders', {
                id,
            });
            return subscription.isActive ? client : null;
        }));
        return interestedClients.filter((client) => client !== null);
    }
}
exports.default = ClientConnection;
