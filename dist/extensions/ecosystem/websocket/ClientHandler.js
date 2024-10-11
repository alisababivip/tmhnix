"use strict";
// clientHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const redis_1 = require("../../../utils/redis");
const queries_1 = require("../utils/scylla/queries");
const utxo_1 = require("../utils/utxo");
const websocket_1 = require("../utils/websocket");
const endpointMap = {
    deposits: 'watchDeposits',
    tickers: 'watchTickers',
    ticker: 'watchTicker',
    orderbook: 'watchOrderBook',
    candles: 'watchCandles',
    orders: 'watchOrders',
};
class ClientHandler {
    endpoint;
    id;
    ws;
    clientConnection;
    dataManager;
    connectionState = 'CLOSED';
    hgetAsync = (0, util_1.promisify)(redis_1.redis.hget).bind(redis_1.redis);
    hsetAsync = (0, util_1.promisify)(redis_1.redis.hset).bind(redis_1.redis);
    hdelAsync = (0, util_1.promisify)(redis_1.redis.hdel).bind(redis_1.redis);
    hkeysAsync = (0, util_1.promisify)(redis_1.redis.hkeys).bind(redis_1.redis);
    constructor(id, clientConnection, dataManager, endpoint) {
        this.id = id;
        this.clientConnection = clientConnection;
        this.dataManager = dataManager;
        this.endpoint = endpoint;
    }
    initialize(ws) {
        if (!ws) {
            return;
        }
        this.ws = ws;
        this.connectionState = 'OPEN';
    }
    handleClientMessage(message) {
        try {
            const messageStr = Buffer.from(message).toString();
            const { method, params } = JSON.parse(messageStr);
            const type = this.endpoint === 'exchange' ? params.method : this.endpoint;
            this.handleSubscription(method, endpointMap[type], params);
        }
        catch (error) {
            console.error('Error in handleClientMessage:', error);
            console.error(error.stack);
        }
    }
    subscriptionHandlers = {
        watchDeposits: {
            subscribe: async (params) => {
                const { chain, address, uuid, currency, ct } = params;
                this.addSubscription('watchDeposits', params);
                this.dataManager.watchDeposits(chain, address, uuid, currency, ct);
                return `Subscribed to ${address} deposits successfully.`;
            },
            unsubscribe: (params) => {
                this.removeSubscription('watchDeposits', params);
                console.log('Unsubscribing from deposits');
                if (['BTC', 'LTC', 'DOGE'].includes(params.chain)) {
                    console.log('Cancelling watch address');
                    (0, utxo_1.cancelWatchAddress)(params.chain, params.address);
                }
                return `Unsubscribed from ${params.address} deposits successfully.`;
            },
        },
        watchTickers: {
            subscribe: async (params) => {
                this.addSubscription('watchTickers', 'all');
                const tickers = await (0, queries_1.getLatestCandles)();
                return {
                    message: `Subscribed to tickers successfully.`,
                    type: 'tickers',
                    result: tickers,
                };
            },
            unsubscribe: (params) => {
                this.removeSubscription('watchTickers', params);
                return `Unsubscribed from tickers successfully.`;
            },
        },
        watchTicker: {
            subscribe: async (params) => {
                this.addSubscription('watchTicker', params);
                return `Subscribed to ${params.symbol} ticker successfully.`;
            },
            unsubscribe: (params) => {
                this.removeSubscription('watchTicker', params);
                return `Unsubscribed from ${params.symbol} ticker successfully.`;
            },
        },
        watchOrderBook: {
            subscribe: async (params) => {
                const { symbol, limit } = params;
                try {
                    const updatedOrderBook = await (0, queries_1.getOrderBook)(symbol);
                    // Add the subscription
                    this.addSubscription('watchOrderBook', { symbol, limit });
                    // Return the latest bids and asks
                    return {
                        message: `Subscribed to ${symbol} order book successfully.`,
                        type: 'orderbook',
                        result: updatedOrderBook,
                    };
                }
                catch (error) {
                    console.error(`Failed to fetch order book for symbol ${symbol}: ${error}`);
                }
            },
            unsubscribe: (_params) => {
                this.removeSubscription('watchOrderBook', _params);
                return `Unsubscribed from ${_params.symbol} order book successfully.`;
            },
        },
        watchCandles: {
            subscribe: async (params) => {
                const { symbol, interval } = params;
                this.addSubscription('watchCandles', { symbol, interval });
                return `Subscribed to ${interval} ${symbol} candles successfully.`;
            },
            unsubscribe: (_params) => {
                this.removeSubscription('watchCandles', _params);
                return `Unsubscribed from ${_params.interval} ${_params.symbol} candles successfully.`;
            },
        },
        watchOrders: {
            subscribe: async (params) => {
                this.addSubscription('watchOrders', params);
                return `Subscribed to orders successfully.`;
            },
            unsubscribe: (params) => {
                this.removeSubscription('watchOrders', params);
                return `Unsubscribed from orders successfully.`;
            },
        },
    };
    handleSubscription(method, type, params) {
        if (this.subscriptionHandlers[type]) {
            if (method === 'SUBSCRIBE') {
                this.subscriptionHandlers[type]
                    .subscribe(params)
                    .then((data) => {
                    this.sendToClient({ status: 'subscribed', data });
                })
                    .catch((err) => {
                    this.sendToClient({ status: 'error', message: err.message });
                });
            }
            else if (method === 'UNSUBSCRIBE') {
                this.subscriptionHandlers[type].unsubscribe(params);
                this.sendToClient({ status: 'unsubscribed', data: params });
            }
        }
        else {
            console.error(`Subscription handler for type ${type} does not exist.`);
        }
    }
    async addSubscription(type, params) {
        const identifier = (0, websocket_1.generateIdentifier)(type, params);
        const existingData = await this.hgetAsync(`subscription:${type}`, identifier);
        const subscribers = existingData ? JSON.parse(existingData) : [];
        if (!subscribers.includes(this.id)) {
            subscribers.push(this.id);
        }
        await this.hsetAsync(`subscription:${type}`, identifier, JSON.stringify(subscribers));
    }
    async getSubscription(type, params) {
        try {
            if (!type || !params) {
                return { isActive: false, params: {} };
            }
            const identifier = (0, websocket_1.generateIdentifier)(type, params);
            const existingData = await this.hgetAsync(`subscription:${type}`, identifier);
            if (existingData) {
                const subscribers = JSON.parse(existingData);
                const isSubscribed = subscribers.includes(this.id);
                return { isActive: isSubscribed, params: params };
            }
            return { isActive: false, params: {} };
        }
        catch (error) {
            console.error('Error in getSubscription:', error);
            return { isActive: false, params: {} };
        }
    }
    async removeSubscription(type, params) {
        const identifier = (0, websocket_1.generateIdentifier)(type, params);
        const existingData = await this.hgetAsync(`subscription:${type}`, identifier);
        if (existingData) {
            const subscribers = JSON.parse(existingData);
            const updatedSubscribers = subscribers.filter((id) => id !== this.id);
            if (updatedSubscribers.length > 0) {
                await this.hsetAsync(`subscription:${type}`, identifier, JSON.stringify(updatedSubscribers));
            }
            else {
                await this.hdelAsync(`subscription:${type}`, identifier);
            }
        }
    }
    async getAllSubscriptionTypes() {
        // You can directly return an array of types if you already know them.
        return [
            'watchDeposits',
            'watchTickers',
            'watchTicker',
            'watchOrderBook',
            'watchCandles',
            'watchOrders',
        ];
    }
    async getAllSubscriptionsForClient(type) {
        try {
            let allTypes = await this.getAllSubscriptionTypes();
            if (type) {
                allTypes = allTypes.filter((t) => t === type);
            }
            const allSubscriptionsPromises = [];
            for (const type of allTypes) {
                const identifiers = await this.hkeysAsync(`subscription:${type}`);
                const typeSubscriptionsPromises = identifiers.map(async (identifier) => {
                    const params = (0, websocket_1.extractParamsFromIdentifier)(type, identifier);
                    const subscription = await this.getSubscription(type, params);
                    if (subscription.isActive) {
                        return { type, params: subscription.params };
                    }
                    return null;
                });
                allSubscriptionsPromises.push(...typeSubscriptionsPromises);
            }
            const allSubscriptions = await Promise.all(allSubscriptionsPromises);
            const filteredSubscriptions = allSubscriptions.filter((sub) => sub !== null);
            this.removeUnusedProviders(filteredSubscriptions);
            return filteredSubscriptions;
        }
        catch (error) {
            console.error('Error fetching all subscriptions:', error);
            return [];
        }
    }
    async removeUnusedProviders(subscriptions) {
        const watchDepositsSubscriptions = subscriptions.filter((sub) => sub.type === 'watchDeposits');
        const activeChains = new Set(watchDepositsSubscriptions.map((sub) => sub.params && sub.params.chain));
        for (const chain of this.dataManager.chainProviders.keys()) {
            if (!activeChains.has(chain)) {
                this.dataManager.removeUnusedChainProviders(chain);
            }
        }
    }
    async removeAllSubscriptions() {
        try {
            const subscriptions = await this.getAllSubscriptionsForClient();
            const removePromises = subscriptions.map(({ type, params }) => {
                return this.removeSubscription(type, params);
            });
            await Promise.all(removePromises);
        }
        catch (error) {
            console.error('Error removing all subscriptions:', error);
        }
    }
    handleClientDisconnection() {
        this.removeAllSubscriptions()
            .then(() => {
            this.clientConnection.removeClient(this.id.toString());
            this.connectionState = 'CLOSED';
        })
            .catch((err) => {
            // Handle error (logging, etc.)
        });
    }
    sendToClient(data) {
        try {
            if (this.ws && this.connectionState === 'OPEN') {
                this.ws.send(JSON.stringify(data));
            }
            else {
                this.clientConnection.removeClient(this.id.toString());
            }
        }
        catch (error) { }
    }
}
exports.default = ClientHandler;
