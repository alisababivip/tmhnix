"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByParams = exports.deleteAllMarketData = exports.updateOrderBookInDB = exports.fetchOrderBooks = exports.generateOrderUpdateQueries = exports.getLatestCandles = exports.getLastCandle = exports.getLastCandles = exports.getAllOpenOrders = exports.getOrderBook = exports.getHistoricalCandles = exports.createOrder = exports.getOrderbookEntry = exports.cancelOrderByUuid = exports.getOrderByUuid = exports.getOrdersByUserId = exports.query = void 0;
const logger_1 = require("../../../../logger");
const passwords_1 = require("../../../../utils/passwords");
const controller_1 = require("../../user/exchange/controller");
const matchingEngine_1 = require("../../user/exchange/matchingEngine");
const queries_1 = require("../../user/wallets/queries");
const blockchain_1 = require("../blockchain");
const client_1 = __importDefault(require("./client"));
const logger = (0, logger_1.createLogger)('ScyllaDB Queries');
async function query(q, params = []) {
    return client_1.default.execute(q, params, { prepare: true });
}
exports.query = query;
/**
 * Retrieves orders by user ID with pagination.
 * @param user_id - The ID of the user whose orders are to be retrieved.
 * @param pageState - The page state for pagination. Default is null.
 * @param limit - The maximum number of orders to retrieve per page. Default is 10.
 * @returns A Promise that resolves with an array of orders and the next page state.
 */
async function getOrdersByUserId(user_id) {
    const query = `
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC;
  `;
    const params = [user_id];
    try {
        const result = await client_1.default.execute(query, params, { prepare: true });
        return result.rows.map(mapRowToOrder);
    }
    catch (error) {
        logger.error(`Failed to fetch orders by user_id: ${error.message}`);
        throw new Error(`Failed to fetch orders by user_id: ${error.message}`);
    }
}
exports.getOrdersByUserId = getOrdersByUserId;
function mapRowToOrder(row) {
    return {
        uuid: row.uuid,
        user_id: row.user_id,
        symbol: row.symbol,
        type: row.type,
        side: row.side,
        price: row.price,
        amount: row.amount,
        filled: row.filled,
        remaining: row.remaining,
        timeInForce: row.timeInForce,
        cost: row.cost,
        fee: row.fee,
        fee_currency: row.fee_currency,
        average: row.average,
        trades: row.trades,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
function getOrderByUuid(user_id, uuid, created_at) {
    const query = `
    SELECT * FROM orders
    WHERE user_id = ? AND uuid = ? AND created_at = ?;
  `;
    const params = [user_id, uuid, created_at];
    return client_1.default
        .execute(query, params, { prepare: true })
        .then((result) => result.rows[0])
        .then(mapRowToOrder);
}
exports.getOrderByUuid = getOrderByUuid;
async function cancelOrderByUuid(user_id, uuid, created_at, symbol, price, side, amount) {
    const priceFormatted = (0, blockchain_1.fromBigInt)(price);
    const orderbookSide = side === 'BUY' ? 'BIDS' : 'ASKS';
    const orderbookAmount = await getOrderbookEntry(symbol, priceFormatted, orderbookSide);
    let orderbookQuery;
    let orderbookParams = [];
    if (orderbookAmount) {
        const newAmount = orderbookAmount - amount;
        if (newAmount <= BigInt(0)) {
            orderbookQuery = `DELETE FROM orderbook WHERE symbol = ? AND price = ? AND side = ?`;
            orderbookParams = [symbol, priceFormatted.toString(), orderbookSide];
        }
        else {
            orderbookQuery = `UPDATE orderbook SET amount = ? WHERE symbol = ? AND price = ? AND side = ?`;
            orderbookParams = [
                (0, blockchain_1.fromBigInt)(newAmount).toString(),
                symbol,
                priceFormatted.toString(),
                orderbookSide,
            ];
        }
    }
    else {
        logger.warn(`No orderbook entry found for symbol: ${symbol}, price: ${priceFormatted}, side: ${orderbookSide}`);
    }
    const deleteOrderQuery = `DELETE FROM orders WHERE user_id = ? AND uuid = ? AND created_at = ?`;
    const deleteOrderParams = [user_id, uuid, created_at];
    const batchQueries = orderbookQuery
        ? [
            { query: orderbookQuery, params: orderbookParams },
            { query: deleteOrderQuery, params: deleteOrderParams },
        ]
        : [{ query: deleteOrderQuery, params: deleteOrderParams }];
    try {
        await client_1.default.batch(batchQueries, { prepare: true });
    }
    catch (error) {
        logger.error(`Failed to cancel order and update orderbook: ${error.message}`);
        throw new Error(`Failed to cancel order and update orderbook: ${error.message}`);
    }
}
exports.cancelOrderByUuid = cancelOrderByUuid;
async function getOrderbookEntry(symbol, price, side) {
    const query = `SELECT * FROM orderbook WHERE symbol = ? AND price = ? AND side = ?`;
    const params = [symbol, price, side];
    try {
        const result = await client_1.default.execute(query, params, { prepare: true });
        if (result.rows.length > 0) {
            const row = result.rows[0];
            return (0, blockchain_1.toBigIntFloat)(row['amount']);
        }
        else {
            logger.warn(`Orderbook entry not found for params: ${JSON.stringify(params)}`);
            return null;
        }
    }
    catch (error) {
        logger.error(`Failed to fetch orderbook entry: ${error.message}`);
        throw new Error(`Failed to fetch orderbook entry: ${error.message}`);
    }
}
exports.getOrderbookEntry = getOrderbookEntry;
/**
 * Creates a new order in the orders table.
 * @param order - The order object to be inserted into the table.
 * @returns A Promise that resolves when the order has been successfully inserted.
 */ async function createOrder(userId, symbol, amount, price, cost, type, side, fee, fee_currency) {
    const currentTimestamp = new Date();
    const query = `
    INSERT INTO orders (uuid, user_id, symbol, type, timeInForce, side, price, amount, filled, remaining, cost, fee, fee_currency, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
    const priceTolerance = (0, blockchain_1.removeTolerance)(price);
    const amountTolerance = (0, blockchain_1.removeTolerance)(amount);
    const costTolerance = (0, blockchain_1.removeTolerance)(cost);
    const feeTolerance = (0, blockchain_1.removeTolerance)(fee);
    const uuid = (0, passwords_1.makeUuid)();
    const params = [
        uuid,
        userId,
        symbol,
        type,
        'GTC',
        side,
        priceTolerance.toString(),
        amountTolerance.toString(),
        '0',
        amountTolerance.toString(),
        costTolerance.toString(),
        feeTolerance.toString(),
        fee_currency,
        'OPEN',
        currentTimestamp,
        currentTimestamp,
    ];
    try {
        const response = await client_1.default.execute(query, params, {
            prepare: true,
        });
        const newOrder = {
            uuid,
            user_id: userId,
            symbol,
            type,
            timeInForce: 'GTC',
            side,
            price: priceTolerance,
            amount: amountTolerance,
            filled: BigInt(0),
            remaining: amountTolerance,
            cost: costTolerance,
            fee: feeTolerance,
            fee_currency,
            average: BigInt(0),
            trades: '',
            status: 'OPEN',
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
        };
        const matchingEngine = await matchingEngine_1.MatchingEngine.getInstance();
        matchingEngine.addToQueue(newOrder);
        return newOrder;
    }
    catch (error) {
        logger.error(`Failed to create order: ${error.message}`);
        throw new Error(`Failed to create order: ${error.message}`);
    }
}
exports.createOrder = createOrder;
async function getHistoricalCandles(symbol, interval, from, to) {
    try {
        const query = `
      SELECT * FROM Candles
      WHERE symbol = ?
      AND interval = ?
      AND created_at >= ?
      AND created_at <= ?
      ORDER BY created_at ASC;
    `;
        const params = [symbol, interval, new Date(from), new Date(to)];
        // Execute the query using your existing ScyllaDB client
        const result = await client_1.default.execute(query, params, { prepare: true });
        // Map the rows to Candle objects
        const candles = result.rows.map((row) => ({
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.volume,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
        return candles;
    }
    catch (error) {
        throw new Error(`Failed to fetch historical candles: ${error.message}`);
    }
}
exports.getHistoricalCandles = getHistoricalCandles;
async function getOrderBook(symbol) {
    const askQuery = `
    SELECT * FROM orderbook WHERE symbol = ? AND side = 'ASKS' LIMIT 50;
  `;
    const bidQuery = `
    SELECT * FROM orderbook WHERE symbol = ? AND side = 'BIDS' ORDER BY price DESC LIMIT 50;
  `;
    const [askRows, bidRows] = await Promise.all([
        client_1.default.execute(askQuery, [symbol], { prepare: true }),
        client_1.default.execute(bidQuery, [symbol], { prepare: true }),
    ]);
    const asks = askRows.rows.map((row) => [row.price, row.amount]);
    const bids = bidRows.rows.map((row) => [row.price, row.amount]);
    return { asks, bids };
}
exports.getOrderBook = getOrderBook;
/**
 * Retrieves all orders with status 'OPEN'.
 * @returns A Promise that resolves with an array of open orders.
 */
async function getAllOpenOrders() {
    const query = `
    SELECT * FROM open_orders WHERE status = 'OPEN';
  `;
    try {
        const result = await client_1.default.execute(query, [], { prepare: true });
        return result.rows;
    }
    catch (error) {
        logger.error(`Failed to fetch all open orders: ${error.message}`);
        throw new Error(`Failed to fetch all open orders: ${error.message}`);
    }
}
exports.getAllOpenOrders = getAllOpenOrders;
// Define a list of intervals you are interested in
const intervals = [
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '12h',
    '1d',
    '3d',
    '1w',
];
/**
 * Fetches the latest candle for each interval.
 * @param symbol - The trading pair symbol for which to fetch the candles.
 * @returns A Promise that resolves with a record containing the latest candle for each interval.
 */
/**
 * Fetches the latest candle for each interval.
 * @returns A Promise that resolves with an array of the latest candles.
 */
async function getLastCandles() {
    try {
        // Fetch the latest candle for each symbol and interval from the materialized view
        const query = `
      SELECT * FROM latest_candles
      LIMIT 1;
    `;
        const result = await client_1.default.execute(query, [], { prepare: true });
        const latestCandles = result.rows.map((row) => {
            return {
                symbol: row.symbol,
                interval: row.interval,
                open: row.open,
                high: row.high,
                low: row.low,
                close: row.close,
                volume: row.volume,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
            };
        });
        return latestCandles;
    }
    catch (error) {
        logger.error(`Failed to fetch latest candles: ${error.message}`);
        throw new Error(`Failed to fetch latest candles: ${error.message}`);
    }
}
exports.getLastCandles = getLastCandles;
// get last candle of 1d interval of a symbol
async function getLastCandle(symbol) {
    try {
        // Fetch the latest candle for each symbol and interval from the materialized view
        const query = `
      SELECT * FROM latest_candles
      WHERE symbol = ?
      AND interval = '1d'
      LIMIT 2;
    `;
        const result = await client_1.default.execute(query, [symbol], { prepare: true });
        const latestCandle = result.rows.map((row) => {
            return {
                symbol: row.symbol,
                interval: row.interval,
                open: row.open,
                high: row.high,
                low: row.low,
                close: row.close,
                volume: row.volume,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
            };
        });
        return latestCandle;
    }
    catch (error) {
        logger.error(`Failed to fetch latest candle: ${error.message}`);
        throw new Error(`Failed to fetch latest candle: ${error.message}`);
    }
}
exports.getLastCandle = getLastCandle;
async function getLatestCandles() {
    try {
        // Get the current date and time and calculate 2 days ago
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        // Query to get candles for the last 2 days
        const query = `
      SELECT * FROM latest_candles
      WHERE created_at >= ?
    `;
        const result = await client_1.default.execute(query, [twoDaysAgo], { prepare: true });
        const latestCandles = {};
        for (const row of result.rows) {
            // Only consider candles with a '1d' interval
            if (row.interval !== '1d') {
                continue;
            }
            const candle = {
                close: row.close,
                volume: row.volume,
                open: row.open,
            };
            if (!latestCandles[row.symbol]) {
                latestCandles[row.symbol] = [];
            }
            latestCandles[row.symbol].push(candle);
        }
        // You might want to sort each symbol's array of candles by date here
        // if the database doesn't already return them in sorted order.
        return latestCandles;
    }
    catch (error) {
        logger.error(`Failed to fetch latest candles: ${error.message}`);
        throw new Error(`Failed to fetch latest candles: ${error.message}`);
    }
}
exports.getLatestCandles = getLatestCandles;
function generateOrderUpdateQueries(ordersToUpdate) {
    const queries = ordersToUpdate.map((order) => {
        return {
            query: `UPDATE orders SET filled = ?, remaining = ?, status = ?, updated_at = ?, trades = ? WHERE user_id = ? AND created_at = ? AND uuid = ?`,
            params: [
                (0, blockchain_1.removeTolerance)(order.filled).toString(),
                (0, blockchain_1.removeTolerance)(order.remaining).toString(),
                order.status,
                new Date(),
                JSON.stringify(order.trades),
                order.user_id,
                order.created_at,
                order.uuid,
            ],
        };
    });
    return queries;
}
exports.generateOrderUpdateQueries = generateOrderUpdateQueries;
async function fetchOrderBooks() {
    const query = 'SELECT * FROM orderbook';
    try {
        const result = await client_1.default.execute(query);
        return result.rows.map((row) => ({
            symbol: row.symbol,
            price: row.price,
            amount: row.amount,
            side: row.side,
        }));
    }
    catch (error) {
        return null;
    }
}
exports.fetchOrderBooks = fetchOrderBooks;
async function updateOrderBookInDB(symbol, price, amount, side) {
    let query;
    let params;
    if (amount > 0) {
        query =
            'INSERT INTO orderbook (symbol, price, amount, side) VALUES (?, ?, ?, ?)';
        params = [symbol, price, amount, side.toUpperCase()];
    }
    else {
        query = 'DELETE FROM orderbook WHERE symbol = ? AND price = ? AND side = ?';
        params = [symbol, price, side.toUpperCase()];
    }
    try {
        await client_1.default.execute(query, params, { prepare: true });
    }
    catch (error) {
        logger.error('Failed to update order book:', error);
    }
}
exports.updateOrderBookInDB = updateOrderBookInDB;
async function deleteAllMarketData(symbol) {
    // Step 1: Fetch the primary keys from the materialized view for orders
    const ordersResult = await client_1.default.execute(`SELECT user_id, created_at, uuid FROM orders_by_symbol WHERE symbol = ?`, [symbol], { prepare: true });
    for (const row of ordersResult.rows) {
        await cancelAndRefundOrder(row.user_id, row.uuid, row.created_at);
    }
    const deleteOrdersQueries = ordersResult.rows.map((row) => ({
        query: 'DELETE FROM orders WHERE user_id = ? AND created_at = ? AND uuid = ?',
        params: [row.user_id, row.created_at, row.uuid],
    }));
    // Step 2: Fetch the primary keys for candles
    const candlesResult = await client_1.default.execute(`SELECT interval, created_at FROM candles WHERE symbol = ?`, [symbol], { prepare: true });
    const deleteCandlesQueries = candlesResult.rows.map((row) => ({
        query: 'DELETE FROM candles WHERE symbol = ? AND interval = ? AND created_at = ?',
        params: [symbol, row.interval, row.created_at],
    }));
    // Step 3: Fetch the primary keys for orderbook
    const sides = ['ASKS', 'BIDS'];
    const deleteOrderbookQueries = [];
    for (const side of sides) {
        const orderbookResult = await client_1.default.execute(`SELECT price FROM orderbook WHERE symbol = ? AND side = ?`, [symbol, side], { prepare: true });
        const queries = orderbookResult.rows.map((row) => ({
            query: 'DELETE FROM orderbook WHERE symbol = ? AND side = ? AND price = ?',
            params: [symbol, side, row.price],
        }));
        deleteOrderbookQueries.push(...queries);
    }
    // Step 4: Combine all queries in a batch
    const batchQueries = [
        ...deleteOrdersQueries,
        ...deleteCandlesQueries,
        ...deleteOrderbookQueries,
    ];
    if (batchQueries.length === 0) {
        return;
    }
    // Step 5: Execute the batch queries
    try {
        await client_1.default.batch(batchQueries, { prepare: true });
    }
    catch (err) {
        logger.error('An error occurred:', err);
    }
}
exports.deleteAllMarketData = deleteAllMarketData;
async function cancelAndRefundOrder(userId, uuid, createdAt) {
    const order = await getOrderByUuid(userId, uuid, createdAt);
    if (!order) {
        logger.warn(`Order not found for UUID: ${uuid}`);
        return;
    }
    // Skip if order is not open or fully filled
    if (order.status !== 'OPEN' || BigInt(order.remaining) === BigInt(0)) {
        return;
    }
    // Calculate refund amount based on remaining amount for partially filled orders
    const refundAmount = order.side === 'BUY'
        ? (0, blockchain_1.fromBigIntMultiply)(BigInt(order.remaining) + BigInt(order.fee), BigInt(order.price))
        : (0, blockchain_1.fromBigInt)(BigInt(order.remaining) + BigInt(order.fee));
    const walletCurrency = order.side === 'BUY'
        ? order.symbol.split('/')[1]
        : order.symbol.split('/')[0];
    const wallet = await (0, queries_1.getWalletOnly)(userId, walletCurrency);
    if (!wallet) {
        logger.warn(`${walletCurrency} wallet not found for user ID: ${userId}`);
        return;
    }
    await (0, controller_1.updateWalletBalance)(wallet, refundAmount, 'add');
}
async function getOrdersByParams(userId, symbol, status, side) {
    let query;
    const params = [];
    // Construct the query based on what primary keys are available
    if (userId !== undefined) {
        query = 'SELECT * FROM orders WHERE user_id = ?';
        params.push(userId);
    }
    else {
        // Note: Fetching all records might not be practical for large tables
        query = 'SELECT * FROM orders';
    }
    // Execute the query
    const result = await client_1.default.execute(query, params, { prepare: true });
    // Map results to Order objects
    let orders = result.rows.map(mapRowToOrder);
    // Filter the results based on the remaining parameters
    if (status) {
        orders = orders.filter((order) => order.status === status);
    }
    if (symbol) {
        orders = orders.filter((order) => order.symbol === symbol);
    }
    if (side) {
        orders = orders.filter((order) => order.side === side);
    }
    return orders;
}
exports.getOrdersByParams = getOrdersByParams;
