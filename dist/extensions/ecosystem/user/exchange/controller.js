"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletBalance = exports.controllers = void 0;
const logger_1 = require("../../../../logger");
const utils_1 = require("../../../../utils");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
const blockchain_1 = require("../../utils/blockchain");
const queries_1 = require("../../utils/scylla/queries");
const queries_2 = require("../markets/queries");
const queries_3 = require("../wallets/queries");
const matchingEngine_1 = require("./matchingEngine");
const logger = (0, logger_1.createLogger)('Ecosystem Orders Controller');
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query, _____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { symbol } = query;
            const orders = await (0, queries_1.getOrdersByUserId)(user.id);
            const ordersBigIntToString = orders
                .filter((order) => order.symbol === symbol)
                .map((order) => ({
                ...order,
                amount: (0, blockchain_1.fromBigInt)(order.amount),
                price: (0, blockchain_1.fromBigInt)(order.price),
                cost: (0, blockchain_1.fromBigInt)(order.cost),
                fee: (0, blockchain_1.fromBigInt)(order.fee),
                filled: (0, blockchain_1.fromBigInt)(order.filled),
                remaining: (0, blockchain_1.fromBigInt)(order.remaining),
            }));
            return ordersBigIntToString;
        }
        catch (error) {
            logger.error(`Failed to fetch orders by user_id: ${error.message}`);
            throw new Error(`Failed to fetch orders by user_id: ${error.message}`);
        }
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { symbol, amount, price, type, side } = body;
            const [currency, pair] = symbol.split('/');
            if (!currency || !pair) {
                throw new Error('Invalid symbol');
            }
            // Fetch fee rates from metadata or other sources
            const market = await (0, queries_2.getMarketBySymbol)(symbol);
            const feeRate = side === 'BUY' ? market.metadata.taker : market.metadata.maker;
            // Calculate fee based on the fee rate
            const fee = (amount * price * feeRate) / 100;
            // Calculate the total cost. Adjust this formula as needed.
            const cost = side === 'BUY' ? amount * price + fee : amount; // For 'SELL', the cost is just the amount
            const currencyWallet = await (0, queries_3.getWalletOnly)(user.id, currency);
            if (!currencyWallet) {
                throw new Error('Currency wallet not found');
            }
            const pairWallet = await (0, queries_3.getWalletOnly)(user.id, pair);
            if (!pairWallet) {
                throw new Error('Pair wallet not found');
            }
            if (side === 'BUY' && pairWallet.balance < cost) {
                throw new Error(`Insufficient balance. You need ${cost} ${pair}`);
            }
            else if (side !== 'BUY' && currencyWallet.balance < amount) {
                throw new Error(`Insufficient balance. You need ${amount} ${currency}`);
            }
            const newOrder = await (0, queries_1.createOrder)(user.id, symbol, (0, blockchain_1.toBigIntFloat)(amount), (0, blockchain_1.toBigIntFloat)(price), (0, blockchain_1.toBigIntFloat)(cost), type, side, (0, blockchain_1.toBigIntFloat)(fee), pair);
            const order = {
                ...newOrder,
                amount: (0, blockchain_1.fromBigInt)(newOrder.amount),
                price: (0, blockchain_1.fromBigInt)(newOrder.price),
                cost: (0, blockchain_1.fromBigInt)(newOrder.cost),
                fee: (0, blockchain_1.fromBigInt)(newOrder.fee),
                remaining: (0, blockchain_1.fromBigInt)(newOrder.remaining),
                filled: 0,
                average: 0,
            };
            if (side === 'BUY') {
                await updateWalletBalance(pairWallet, order.cost, 'subtract');
            }
            else {
                await updateWalletBalance(currencyWallet, order.amount, 'subtract');
            }
            return {
                message: 'Order created successfully',
                ...order,
            };
        }
        catch (error) {
            logger.error(`Failed to create new order: ${error.message}`);
            throw new Error(`Failed to create new order: ${error.message}`);
        }
    }),
    cancel: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { uuid } = params;
            const { created_at } = body;
            const order = await (0, queries_1.getOrderByUuid)(user.id, uuid, created_at);
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.status !== 'OPEN') {
                throw new Error('Order is not open');
            }
            if (BigInt(order.filled) !== BigInt(0) &&
                BigInt(order.remaining) !== BigInt(0)) {
                throw new Error('Order is already partially filled');
            }
            if (BigInt(order.remaining) === BigInt(0)) {
                throw new Error('Order is already filled');
            }
            await (0, queries_1.cancelOrderByUuid)(user.id, uuid, created_at, order.symbol, BigInt(order.price), order.side, BigInt(order.amount));
            // Refund logic
            const refundAmount = order.side === 'BUY' ? (0, blockchain_1.fromBigInt)(order.cost) : (0, blockchain_1.fromBigInt)(order.amount);
            const walletCurrency = order.side === 'BUY'
                ? order.symbol.split('/')[1]
                : order.symbol.split('/')[0];
            const wallet = await (0, queries_3.getWalletOnly)(user.id, walletCurrency);
            if (!wallet) {
                throw new Error(`${walletCurrency} wallet not found`);
            }
            await updateWalletBalance(wallet, refundAmount, 'add');
            const matchingEngine = await matchingEngine_1.MatchingEngine.getInstance();
            await matchingEngine.handleOrderCancellation(uuid, order.symbol);
            return {
                message: 'Order cancelled and balance refunded successfully',
            };
        }
        catch (error) {
            throw new Error(`Failed to cancel order: ${error.message}`);
        }
    }),
    getHistorical: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { symbol, from, to, interval } = query;
            if (typeof from === 'undefined' ||
                typeof to === 'undefined' ||
                typeof interval === 'undefined') {
                throw new Error('Both `from`, `to`, and `interval` must be provided.');
            }
            // Fetch the orders
            const bars = await (0, queries_1.getHistoricalCandles)(symbol, interval, Number(from), Number(to));
            return bars;
        }
        catch (error) {
            logger.error(`Failed to fetch historical data: ${error.message}`);
            throw new Error(`Failed to fetch historical data: ${error.message}`);
        }
    }),
    ticker: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { symbol } = query;
            const ticker = await (0, queries_1.getLastCandle)(symbol);
            return ticker;
        }
        catch (error) {
            logger.error(`Failed to fetch ticker data: ${error.message}`);
            throw new Error(`Failed to fetch ticker data: ${error.message}`);
        }
    }),
};
async function updateWalletBalance(wallet, balanceChange, type) {
    if (!wallet)
        throw new Error('Wallet not found');
    let newBalance;
    // Function to round to 4 decimal places
    const roundTo4DecimalPlaces = (num) => Math.round((num + Number.EPSILON) * 1e8) / 1e8;
    switch (type) {
        case 'add':
            newBalance = roundTo4DecimalPlaces(wallet.balance + balanceChange);
            break;
        case 'subtract':
            newBalance = roundTo4DecimalPlaces(wallet.balance - balanceChange);
            break;
        default:
            throw new Error('Invalid type specified for updating wallet balance.');
    }
    // Update the wallet and log the response
    const updatedWallet = await prisma_1.default.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: newBalance,
        },
    });
    return updatedWallet;
}
exports.updateWalletBalance = updateWalletBalance;
