"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const queries_1 = require("~~/http/wallets/spot/queries");
const utils_1 = require("~~/utils");
const exchange_1 = __importDefault(require("~~/utils/exchange"));
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const queries_2 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        return (0, queries_2.getOrders)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        try {
            return await (0, queries_2.getOrder)(params.uuid);
        }
        catch (error) {
            throw new Error('Order not found');
        }
    }),
    store: (0, utils_1.handleController)(async (_, __, ____, ___, body, user) => {
        if (!user) {
            console.log('User not found');
            throw new Error('User not found');
        }
        try {
            const { symbol, amount: amountString, price: priceString, type, side, } = body;
            const [currency, pair] = symbol.split('/');
            if (!currency || !pair) {
                throw new Error('Invalid symbol');
            }
            const amount = Number(amountString);
            const price = Number(priceString);
            // Fetch fee rates from metadata or other sources
            const market = (await prisma_1.default.exchange_market.findUnique({
                where: { symbol: symbol },
            }));
            if (!market) {
                throw new Error('Market data not found');
            }
            const minAmount = Number(market.metadata.limits.amount.min);
            const minCost = Number(market.metadata.limits.cost.min);
            if (amount < minAmount) {
                throw new Error(`Amount is too low. You need ${minAmount} ${currency}`);
            }
            const fee_currency = side === 'BUY' ? currency : pair;
            const feeRate = side === 'BUY'
                ? Number(market.metadata.taker)
                : Number(market.metadata.maker);
            const fee = (amount * price * feeRate) / 100;
            const cost = side === 'BUY' ? amount * price + fee : amount;
            if (cost < minCost) {
                console.log('Cost is too low:', { cost, minCost });
                throw new Error(`Cost is too low. You need ${minCost} ${pair}`);
            }
            const currencyWallet = await (0, queries_1.getWalletQuery)(user.id, currency);
            if (!currencyWallet) {
                throw new Error('Currency wallet not found');
            }
            const pairWallet = await (0, queries_1.getWalletQuery)(user.id, pair);
            if (!pairWallet) {
                throw new Error('Pair wallet not found');
            }
            if (side === 'BUY' && pairWallet.balance < cost) {
                throw new Error(`Insufficient balance. You need ${cost} ${pair}`);
            }
            else if (side !== 'BUY' && currencyWallet.balance < amount) {
                throw new Error(`Insufficient balance. You need ${amount} ${currency}`);
            }
            const exchange = await exchange_1.default.startExchange();
            if (!exchange) {
                throw new Error('Exchange offline');
            }
            let order;
            try {
                order = await exchange.createOrder(symbol, type.toLowerCase(), side.toLowerCase(), amount, type === 'LIMIT' ? price : undefined);
            }
            catch (error) {
                console.log(error);
                throw new Error(`Failed to create order: ${error.message}`);
            }
            if (!order || !order.id) {
                throw new Error('Failed to create order');
            }
            const orderData = await exchange.fetchOrder(order.id, symbol);
            if (!orderData) {
                throw new Error('Failed to fetch order');
            }
            if (side === 'BUY') {
                const balance = pairWallet.balance - cost;
                await (0, queries_2.updateWalletQuery)(pairWallet.id, {
                    balance,
                });
                if (orderData.status === 'closed') {
                    const balance = currencyWallet.balance +
                        (Number(orderData.amount) - (Number(orderData.fee?.cost) || fee));
                    await (0, queries_2.updateWalletQuery)(currencyWallet.id, {
                        balance,
                    });
                }
            }
            else {
                const balance = currencyWallet.balance - amount;
                await (0, queries_2.updateWalletQuery)(currencyWallet.id, {
                    balance,
                });
                if (orderData.status === 'closed') {
                    const balance = pairWallet.balance +
                        (Number(orderData.cost) - (Number(orderData.fee?.cost) || fee));
                    await (0, queries_2.updateWalletQuery)(pairWallet.id, {
                        balance,
                    });
                }
            }
            const response = (await (0, queries_2.createOrder)(user.id, {
                ...orderData,
                reference_id: order.id,
                fee_currency: fee_currency,
                fee: orderData.fee?.cost || fee,
            }));
            if (!response) {
                throw new Error('Failed to create order');
            }
            return {
                order: response,
                message: 'Order created successfully',
            };
        }
        catch (error) {
            console.error('Error in store controller:', error);
            throw new Error(error.message);
        }
    }),
    // Your cancel handler
    cancel: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        const order = await (0, queries_2.getOrder)(params.uuid);
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status === 'CANCELED') {
            throw new Error('Order already cancelled');
        }
        if (order.user_id !== user.id) {
            throw new Error('Order not found');
        }
        const exchange = await exchange_1.default.startExchange();
        if (!exchange) {
            throw new Error('Exchange offline');
        }
        let orderData;
        try {
            if (exchange.has['fetchOrder']) {
                orderData = await exchange.fetchOrder(order.reference_id, order.symbol);
            }
            else {
                const orders = await exchange.fetchOrders(order.symbol);
                orderData = orders.find((o) => o.id === order.reference_id);
            }
            if (!orderData || !orderData.id) {
                throw new Error('Failed to fetch order');
            }
            const filteredUpdateData = await updateOrderData(order.uuid, orderData);
            if (orderData.status !== 'open') {
                throw new Error('Order is not open');
            }
            if (orderData.filled !== 0) {
                throw new Error('Order is partially filled');
            }
            await exchange.cancelOrder(order.reference_id, order.symbol);
            const walletCurrency = orderData.side === 'buy'
                ? order.symbol.split('/')[1]
                : order.symbol.split('/')[0];
            const wallet = await (0, queries_1.getWalletQuery)(user.id, walletCurrency);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const cost = order.price * order.amount;
            const balanceUpdate = orderData.side === 'buy'
                ? wallet.balance + cost
                : wallet.balance + order.amount;
            // Start a Prisma transaction
            const transaction = await prisma_1.default.$transaction([
                prisma_1.default.exchange_orders.update({
                    where: { uuid: order.uuid },
                    data: filteredUpdateData,
                }),
                prisma_1.default.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: balanceUpdate },
                }),
            ]);
            if (!transaction) {
                throw new Error('Transaction failed');
            }
            const newOrder = await updateOrderData(order.uuid, {
                ...orderData,
                status: 'CANCELED',
            });
            return {
                ...newOrder,
                message: 'Order cancelled successfully',
            };
        }
        catch (error) {
            console.error('Error:', error);
            throw new Error(error.message);
        }
    }),
    // Your check handler
    check: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        const order = await (0, queries_2.getOrder)(params.uuid);
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.user_id !== user.id) {
            throw new Error('Order not found');
        }
        const exchange = await exchange_1.default.startExchange();
        if (!exchange) {
            throw new Error('Exchange offline');
        }
        let orderData;
        try {
            if (exchange.has['fetchOrder']) {
                orderData = await exchange.fetchOrder(order.reference_id, order.symbol);
            }
            else {
                const orders = await exchange.fetchOrders(order.symbol);
                orderData = orders.find((o) => o.id === order.reference_id);
            }
            if (!orderData || !orderData.id) {
                throw new Error('Failed to fetch order');
            }
            const updatedOrder = await updateOrderData(order.uuid, orderData);
            if (updatedOrder.status === 'CLOSED') {
                await updateWalletBalance(user.id, updatedOrder);
            }
            return updatedOrder;
        }
        catch (error) {
            console.error('Error:', error);
            throw new Error(error.message);
        }
    }),
};
async function updateOrderData(uuid, orderData) {
    const updateData = {
        status: orderData.status.toUpperCase(),
        filled: orderData.filled,
        remaining: orderData.remaining,
        cost: orderData.cost,
        fee: orderData.fee?.cost,
        trades: orderData.trades,
        average: orderData.average,
    };
    // Remove undefined properties
    const filteredUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== undefined));
    return await prisma_1.default.exchange_orders.update({
        where: {
            uuid: uuid,
        },
        data: filteredUpdateData,
    });
}
// New function to update wallet balance
async function updateWalletBalance(userId, order) {
    const [currency, pair] = order.symbol.split('/');
    const amount = Number(order.amount);
    const cost = Number(order.cost);
    const fee = Number(order.fee || 0);
    const currencyWallet = await (0, queries_1.getWalletQuery)(userId, currency);
    const pairWallet = await (0, queries_1.getWalletQuery)(userId, pair);
    if (order.side === 'BUY') {
        const newBalance = currencyWallet.balance + (amount - fee);
        await (0, queries_2.updateWalletQuery)(currencyWallet.id, { balance: newBalance });
    }
    else {
        // sell
        const newBalance = pairWallet.balance + (cost - fee);
        await (0, queries_2.updateWalletQuery)(pairWallet.id, { balance: newBalance });
    }
}
