"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingEngine = void 0;
const blockchain_1 = require("../../utils/blockchain");
const candles_1 = require("../../utils/candles");
const matchmaking_1 = require("../../utils/matchmaking");
const orderbook_1 = require("../../utils/orderbook");
const client_1 = __importDefault(require("../../utils/scylla/client"));
const queries_1 = require("../../utils/scylla/queries");
const websocket_1 = require("../../utils/websocket");
const DataManager_1 = __importDefault(require("../../websocket/DataManager"));
const queries_2 = require("../markets/queries");
class MatchingEngine {
    dataManager;
    static instancePromise = null;
    orderQueue = {};
    marketsBySymbol = {};
    lockedOrders = new Set();
    lastCandle = {};
    async processQueue() {
        const ordersToUpdate = [];
        const orderBookUpdates = {};
        // Fetch all order book entries from the database
        const allOrderBookEntries = await (0, queries_1.fetchOrderBooks)();
        // Map the order book entries by symbol and then by side ('bids' or 'asks')
        const mappedOrderBook = {};
        allOrderBookEntries?.forEach((entry) => {
            if (!mappedOrderBook[entry.symbol]) {
                mappedOrderBook[entry.symbol] = { bids: {}, asks: {} };
            }
            mappedOrderBook[entry.symbol][entry.side.toLowerCase()][(0, blockchain_1.removeTolerance)((0, blockchain_1.toBigIntFloat)(Number(entry.price))).toString()] = (0, blockchain_1.removeTolerance)((0, blockchain_1.toBigIntFloat)(Number(entry.amount)));
        });
        // Phase 1: Calculations
        const calculationPromises = [];
        for (const symbol in this.orderQueue) {
            const orders = this.orderQueue[symbol];
            if (orders.length === 0)
                continue;
            const promise = (async () => {
                const { matchedOrders, bookUpdates } = await (0, matchmaking_1.matchAndCalculateOrders)(orders, mappedOrderBook[symbol] || { bids: {}, asks: {} });
                // Early return if no orders are matched for the current symbol
                if (matchedOrders.length === 0) {
                    return;
                }
                ordersToUpdate.push(...matchedOrders);
                orderBookUpdates[symbol] = bookUpdates;
            })();
            calculationPromises.push(promise);
        }
        await Promise.all(calculationPromises);
        if (ordersToUpdate.length === 0) {
            return;
        }
        // Phase 2: Update database
        await this.performUpdates(ordersToUpdate, orderBookUpdates);
        // Accumulate the final state of the order book
        const finalOrderBooks = {}; // Initialize as needed
        for (const symbol in orderBookUpdates) {
            // Assume `applyUpdatesToOrderBook` is a function that applies updates to the current state
            finalOrderBooks[symbol] = (0, orderbook_1.applyUpdatesToOrderBook)(mappedOrderBook[symbol], orderBookUpdates[symbol]);
        }
        // Phase 3: Cleanup
        const cleanupPromises = [];
        for (const symbol in this.orderQueue) {
            const promise = (async () => {
                this.orderQueue[symbol] = this.orderQueue[symbol].filter((order) => order.status === 'OPEN');
            })();
            cleanupPromises.push(promise);
        }
        await Promise.all(cleanupPromises);
        // Phase 4: Broadcast
        this.broadcastUpdates(ordersToUpdate, finalOrderBooks);
    }
    async performUpdates(ordersToUpdate, orderBookUpdates) {
        // Step 1: Lock the orders
        const locked = this.lockOrders(ordersToUpdate);
        if (!locked) {
            console.warn("Couldn't obtain a lock on all orders, skipping this batch.");
            return;
        }
        // Step 2: Perform the updates
        const updateQueries = [];
        // Generate queries for updating orders
        updateQueries.push(...(0, queries_1.generateOrderUpdateQueries)(ordersToUpdate));
        // Generate queries for updating candles
        const latestOrdersForCandles = (0, candles_1.getLatestOrdersForCandles)(ordersToUpdate);
        latestOrdersForCandles.forEach((order) => {
            updateQueries.push(...this.updateLastCandles(order));
        });
        // Generate queries for updating the order book
        const orderBookQueries = (0, orderbook_1.generateOrderBookUpdateQueries)(orderBookUpdates);
        updateQueries.push(...orderBookQueries);
        // Execute batch update
        if (updateQueries.length > 0) {
            try {
                await client_1.default.batch(updateQueries, { prepare: true });
            }
            catch (error) {
                console.error('Failed to batch update:', error);
            }
        }
        else {
            console.warn('No queries to batch update.');
        }
        // Step 3: Unlock the orders
        this.unlockOrders(ordersToUpdate);
    }
    async addToQueue(order) {
        if (!(0, matchmaking_1.validateOrder)(order)) {
            console.log('Invalid order. Not adding to queue.', order);
            return;
        }
        if (isNaN(order.created_at.getTime()) ||
            isNaN(order.updated_at.getTime())) {
            console.error('Invalid date in order:', order);
            return;
        }
        // Initialize the queue for the symbol if it doesn't exist
        if (!this.orderQueue[order.symbol]) {
            this.orderQueue[order.symbol] = [];
        }
        // Push the order into the queue
        this.orderQueue[order.symbol].push(order);
        // Update the order book immediately
        const symbolOrderBook = await (0, orderbook_1.updateSingleOrderBook)(order, 'add');
        this.dataManager.handleOrderBookUpdate(order.symbol, symbolOrderBook);
        await this.processQueue();
    }
    updateLastCandles(order) {
        let finalPrice = BigInt(0);
        if (order.trades &&
            order.trades.length > 0 &&
            order.trades[order.trades.length - 1].price !== undefined) {
            finalPrice = (0, blockchain_1.toBigIntFloat)(order.trades[order.trades.length - 1].price);
        }
        else if (order.price !== undefined) {
            finalPrice = order.price;
        }
        else {
            console.error('Neither trade prices nor order price are available');
            return [];
        }
        const updateQueries = [];
        if (!this.lastCandle[order.symbol]) {
            this.lastCandle[order.symbol] = {};
        }
        candles_1.intervals.forEach((interval) => {
            const updateQuery = this.generateCandleQueries(order, interval, finalPrice);
            if (updateQuery) {
                updateQueries.push(updateQuery);
            }
        });
        return updateQueries;
    }
    generateCandleQueries(order, interval, finalPrice) {
        const existingLastCandle = this.lastCandle[order.symbol]?.[interval];
        const normalizedCurrentTime = (0, websocket_1.normalizeTimeToInterval)(new Date().getTime(), interval);
        const normalizedLastCandleTime = existingLastCandle
            ? (0, websocket_1.normalizeTimeToInterval)(new Date(existingLastCandle.created_at).getTime(), interval)
            : null;
        const shouldCreateNewCandle = !existingLastCandle || normalizedCurrentTime !== normalizedLastCandleTime;
        if (shouldCreateNewCandle) {
            const newOpenPrice = existingLastCandle
                ? existingLastCandle.close
                : (0, blockchain_1.fromBigInt)(finalPrice);
            if (!newOpenPrice) {
                console.log('newOpenPrice is null');
                return null;
            }
            const finalPriceNumber = (0, blockchain_1.fromBigInt)(finalPrice);
            const normalizedTime = new Date((0, websocket_1.normalizeTimeToInterval)(new Date().getTime(), interval));
            const newLastCandle = {
                symbol: order.symbol,
                interval,
                open: newOpenPrice,
                high: Math.max(newOpenPrice, finalPriceNumber),
                low: Math.min(newOpenPrice, finalPriceNumber),
                close: finalPriceNumber,
                volume: (0, blockchain_1.fromBigInt)(order.amount),
                created_at: normalizedTime,
                updated_at: new Date(),
            };
            this.lastCandle[order.symbol][interval] = newLastCandle;
            // Insert new candle into DB
            return {
                query: 'INSERT INTO candles (symbol, interval, created_at, updated_at, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                params: [
                    order.symbol,
                    interval,
                    newLastCandle.created_at,
                    newLastCandle.updated_at,
                    newOpenPrice,
                    newLastCandle.high,
                    newLastCandle.low,
                    newLastCandle.close,
                    newLastCandle.volume,
                ],
            };
        }
        else {
            let updateQuery = 'UPDATE candles SET updated_at = ?, close = ?';
            const now = new Date();
            const finalPriceNumber = (0, blockchain_1.fromBigInt)(finalPrice);
            const updateParams = [now, finalPriceNumber];
            const newVolume = existingLastCandle.volume + (0, blockchain_1.fromBigInt)(order.amount);
            updateQuery += ', volume = ?';
            updateParams.push(newVolume);
            if (finalPriceNumber > existingLastCandle.high) {
                updateQuery += ', high = ?';
                updateParams.push(finalPriceNumber);
                existingLastCandle.high = finalPriceNumber;
            }
            else if (finalPriceNumber < existingLastCandle.low) {
                updateQuery += ', low = ?';
                updateParams.push(finalPriceNumber);
                existingLastCandle.low = finalPriceNumber;
            }
            existingLastCandle.close = finalPriceNumber; // Add this line to update close price
            existingLastCandle.volume = newVolume; // Add this line to update volume
            existingLastCandle.updated_at = now; // Add this line to update timestamp
            // Update the lastCandle cache
            this.lastCandle[order.symbol][interval] = existingLastCandle;
            updateQuery += ' WHERE symbol = ? AND interval = ? AND created_at = ?';
            updateParams.push(order.symbol, interval, existingLastCandle.created_at);
            return {
                query: updateQuery,
                params: updateParams,
            };
        }
    }
    // extra
    async broadcastUpdates(ordersToUpdate, finalOrderBooks) {
        const updatePromises = [];
        // Create promise for Order Updates
        updatePromises.push(...this.createOrdersBroadcastPromise(ordersToUpdate));
        // Create promises for Order Book and Candle Broadcasts
        for (const symbol in this.orderQueue) {
            updatePromises.push(this.createOrderBookUpdatePromise(symbol, finalOrderBooks[symbol]));
            updatePromises.push(...this.createCandleBroadcastPromises(symbol));
        }
        // Wait for all updates to complete
        await Promise.all(updatePromises);
    }
    createOrderBookUpdatePromise(symbol, finalOrderBookState) {
        return this.dataManager.handleOrderBookUpdate(symbol, finalOrderBookState);
    }
    createCandleBroadcastPromises(symbol) {
        const promises = [];
        for (const interval in this.lastCandle[symbol]) {
            promises.push(this.dataManager.handleCandleBroadcast(symbol, interval, this.lastCandle[symbol][interval]));
        }
        promises.push(this.dataManager.handleTickerBroadcast(symbol, this.lastCandle[symbol]['1d']), this.dataManager.handleTickersBroadcast(this.getAllSymbols1DayCandles()));
        return promises;
    }
    getAllSymbols1DayCandles() {
        const symbolsWithCandles = {};
        for (const symbol in this.lastCandle) {
            const lastCandle1d = this.lastCandle[symbol]['1d'];
            if (lastCandle1d) {
                symbolsWithCandles[symbol] = lastCandle1d;
            }
        }
        return symbolsWithCandles;
    }
    createOrdersBroadcastPromise(orders) {
        return orders.map((order) => this.dataManager.handleOrderBroadcast(order));
    }
    lockOrders(orders) {
        for (const order of orders) {
            if (this.lockedOrders.has(order.uuid)) {
                return false;
            }
        }
        for (const order of orders) {
            this.lockedOrders.add(order.uuid);
        }
        return true;
    }
    unlockOrders(orders) {
        for (const order of orders) {
            this.lockedOrders.delete(order.uuid);
        }
    }
    static getInstance() {
        if (!this.instancePromise) {
            this.instancePromise = (async () => {
                const instance = new MatchingEngine();
                await instance.init();
                return instance;
            })();
        }
        return this.instancePromise;
    }
    async init() {
        this.dataManager = DataManager_1.default.getInstance();
        await this.initializeMarkets();
        await this.initializeOrders();
        await this.initializeLastCandles();
    }
    async initializeMarkets() {
        const markets = await (0, queries_2.getMarkets)();
        markets.forEach((market) => {
            this.marketsBySymbol[market.symbol] = market;
            this.orderQueue[market.symbol] = [];
        });
    }
    async initializeOrders() {
        try {
            const openOrders = await (0, queries_1.getAllOpenOrders)();
            openOrders.forEach((order) => {
                const normalizedOrder = {
                    ...order,
                    amount: BigInt(order.amount ?? 0),
                    price: BigInt(order.price ?? 0),
                    cost: BigInt(order.cost ?? 0),
                    fee: BigInt(order.fee ?? 0),
                    remaining: BigInt(order.remaining ?? 0),
                    filled: BigInt(order.filled ?? 0),
                };
                if (!this.orderQueue[normalizedOrder.symbol]) {
                    this.orderQueue[normalizedOrder.symbol] = [];
                }
                this.orderQueue[normalizedOrder.symbol].push(normalizedOrder);
            });
            await this.processQueue();
        }
        catch (error) {
            console.error(`Failed to populate order queue with open orders: ${error}`);
        }
    }
    async initializeLastCandles() {
        try {
            const lastCandles = await (0, queries_1.getLastCandles)();
            lastCandles.forEach((candle) => {
                if (!this.lastCandle[candle.symbol]) {
                    this.lastCandle[candle.symbol] = {};
                }
                this.lastCandle[candle.symbol][candle.interval] = candle;
            });
        }
        catch (error) {
            console.error(`Failed to initialize last candles: ${error}`);
        }
    }
    async handleOrderCancellation(orderId, symbol) {
        // Remove the order from the internal queue
        this.orderQueue[symbol] = this.orderQueue[symbol].filter((order) => order.uuid !== orderId);
        // Broadcast the updated order book. Assuming fetchExistingAmounts fetches the latest state.
        const updatedOrderBook = await (0, orderbook_1.fetchExistingAmounts)(symbol);
        this.broadcastOrderBookUpdate(symbol, updatedOrderBook);
        // Optionally, process the remaining queue if necessary
        await this.processQueue();
    }
    broadcastOrderBookUpdate(symbol, orderBook) {
        // Broadcasting logic
        this.dataManager.handleOrderBookUpdate(symbol, orderBook);
    }
}
exports.MatchingEngine = MatchingEngine;
