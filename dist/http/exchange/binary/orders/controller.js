"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPendingOrders = exports.controllers = void 0;
const utils_1 = require("../../../../utils");
const exchange_1 = __importDefault(require("../../../../utils/exchange"));
const queries_1 = require("./queries");
const orderIntervals = new Map();
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        const { type } = query;
        return (0, queries_1.getBinaryOrders)(user.id, type);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        return (0, queries_1.getBinaryOrder)(user.id, params.uuid);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
            const transaction = await (0, queries_1.createBinaryOrder)(user.id, body.order);
            startOrderMonitoring(user.id, transaction.uuid, body.order.symbol, new Date(body.order.closed_at).getTime());
            return transaction;
        }
        catch (error) {
            throw new Error(error);
        }
    }),
    cancel: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        return (0, queries_1.cancelBinaryOrder)(params.uuid, body.percentage);
    }),
    processPending: (0, utils_1.handleController)(async () => {
        return await processPendingOrders();
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await processPendingOrders();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
function startOrderMonitoring(userId, orderUuid, symbol, closedAt) {
    const currentTimeUtc = new Date().getTime();
    const delay = closedAt - currentTimeUtc;
    const timer = setTimeout(() => {
        processOrder(userId, orderUuid, symbol);
    }, delay);
    orderIntervals.set(orderUuid, timer);
}
async function processOrder(userId, orderUuid, symbol) {
    try {
        const exchange = await exchange_1.default.startExchange();
        const provider = await exchange_1.default.provider;
        let data;
        switch (provider) {
            case 'kucoin':
            case 'binance':
            case 'bitget':
                data = await exchange.fetchTicker(symbol);
                break;
            default:
                throw new Error('Provider not supported');
        }
        const order = await (0, queries_1.getBinaryOrder)(userId, orderUuid);
        const price = data.last;
        const updateData = determineOrderStatus(order, price);
        // Update the order in the database
        await (0, queries_1.updateBinaryOrder)(orderUuid, updateData);
        // Remove the timeout entry for this order (optional, since it has already executed)
        orderIntervals.delete(orderUuid);
    }
    catch (error) {
        console.error(`Error fetching OHLCV data for order ${orderUuid}: ${error}`);
    }
}
async function processPendingOrders() {
    try {
        const pendingOrders = await (0, queries_1.getBinaryOrdersByStatus)('PENDING');
        const currentTime = new Date().getTime();
        const unmonitoredOrders = pendingOrders.filter((order) => {
            const closedAtTime = new Date(order.closed_at).getTime();
            return closedAtTime <= currentTime && !orderIntervals.has(order.uuid);
        });
        const exchange = await exchange_1.default.startExchange();
        for (const order of unmonitoredOrders) {
            const timeframe = '1m';
            const ohlcv = await exchange.fetchOHLCV(order.symbol, timeframe, Number(order.closed_at) - 60000, 2);
            const closePrice = ohlcv[1][4];
            const updateData = determineOrderStatus(order, closePrice);
            await (0, queries_1.updateBinaryOrder)(order.uuid, updateData);
        }
    }
    catch (error) {
        console.error('Error processing pending orders:', error);
    }
}
exports.processPendingOrders = processPendingOrders;
function determineOrderStatus(order, closePrice) {
    const updateData = {
        close_price: closePrice,
    };
    switch (order.type) {
        case 'RISE_FALL':
            if (order.side === 'RISE' && closePrice > order.price) {
                updateData.status = 'WIN';
            }
            else if (order.side === 'FALL' && closePrice < order.price) {
                updateData.status = 'WIN';
            }
            else if (closePrice === order.price) {
                updateData.status = 'DRAW';
            }
            else {
                updateData.status = 'LOSS';
                updateData.profit = 100;
            }
            break;
    }
    return updateData;
}
