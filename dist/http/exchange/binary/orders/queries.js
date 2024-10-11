"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBinaryOrder = exports.cancelBinaryOrder = exports.createBinaryOrder = exports.getBinaryOrder = exports.getBinaryOrdersByStatus = exports.getBinaryOrders = void 0;
const emails_1 = require("../../../../utils/emails");
const passwords_1 = require("../../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getBinaryOrders(user_id, type) {
    const where = {
        user_id: user_id,
    };
    if (type === 'LIVE') {
        where['is_demo'] = false;
    }
    if (type === 'PRACTICE') {
        where['is_demo'] = true;
    }
    return (await prisma_1.default.binary_orders.findMany({
        where: where,
    }));
}
exports.getBinaryOrders = getBinaryOrders;
async function getBinaryOrdersByStatus(status) {
    return (await prisma_1.default.binary_orders.findMany({
        where: {
            status: status,
        },
    }));
}
exports.getBinaryOrdersByStatus = getBinaryOrdersByStatus;
async function getBinaryOrder(user_id, uuid) {
    return (await prisma_1.default.binary_orders.findUnique({
        where: {
            uuid: uuid,
            user_id: user_id,
        },
    }));
}
exports.getBinaryOrder = getBinaryOrder;
async function createBinaryOrder(user_id, order) {
    let currency, wallet, balance;
    const isDemo = order.is_demo || false;
    if (!isDemo) {
        currency = order.symbol.split('/')[1];
        wallet = await prisma_1.default.wallet.findFirst({
            where: {
                user_id: user_id,
                currency: currency,
                type: 'SPOT',
            },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        balance = wallet.balance - order.amount;
        if (balance < 0) {
            throw new Error('Insufficient balance');
        }
        await prisma_1.default.wallet.update({
            where: {
                id: wallet.id,
            },
            data: {
                balance: balance,
            },
        });
    }
    const closeAtDate = new Date(order.closed_at);
    const finalOrder = await prisma_1.default.binary_orders.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: user_id,
            symbol: order.symbol,
            type: order.type,
            side: order.side,
            status: 'PENDING',
            price: order.price,
            profit: order.profit,
            amount: order.amount,
            is_demo: isDemo,
            closed_at: closeAtDate,
        },
    });
    if (!isDemo) {
        await prisma_1.default.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: user_id,
                wallet_id: wallet.id,
                type: 'BINARY_ORDER',
                status: 'PENDING',
                amount: order.amount,
                fee: 0,
                description: `Binary Position | Market: ${order.symbol} | Amount: ${order.amount} ${currency} | Price: ${order.price} | Profit Margin: ${order.profit}% | Side: ${order.side} | Expiration: ${order.closed_at.toLocaleString()} | Type: ${isDemo ? 'Practice' : 'Live'} Position`,
                reference_id: finalOrder.uuid,
            },
        });
    }
    return finalOrder;
}
exports.createBinaryOrder = createBinaryOrder;
async function cancelBinaryOrder(uuid, percentage) {
    const order = await prisma_1.default.binary_orders.findUnique({
        where: {
            uuid: uuid,
        },
    });
    if (!order) {
        throw new Error('Order not found');
    }
    let wallet, balance, transaction;
    const isDemo = order.is_demo || false;
    if (!isDemo) {
        transaction = await prisma_1.default.transaction.findUnique({
            where: {
                reference_id: order.uuid,
            },
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        wallet = await prisma_1.default.wallet.findUnique({
            where: {
                id: transaction.wallet_id,
            },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        balance = wallet.balance + order.amount;
        if (percentage !== undefined && percentage < 0) {
            const cutAmount = order.amount * (Math.abs(percentage) / 100);
            balance = wallet.balance + order.amount - cutAmount;
        }
        await prisma_1.default.wallet.update({
            where: {
                id: wallet.id,
            },
            data: {
                balance: balance,
            },
        });
        await prisma_1.default.transaction.delete({
            where: {
                uuid: transaction.uuid,
            },
        });
    }
    return (await prisma_1.default.binary_orders.delete({
        where: {
            uuid: uuid,
        },
    }));
}
exports.cancelBinaryOrder = cancelBinaryOrder;
async function updateBinaryOrder(orderId, updateData) {
    const order = (await prisma_1.default.binary_orders.update({
        where: { uuid: orderId },
        data: updateData,
    }));
    if (['WIN', 'LOSS', 'DRAW'].includes(order.status)) {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: order.user_id,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        await (0, emails_1.sendBinaryOrderEmail)(user, order);
    }
    let wallet, balance, transaction;
    const isDemo = order.is_demo || false;
    if (!isDemo) {
        transaction = await prisma_1.default.transaction.findUnique({
            where: {
                reference_id: order.uuid,
            },
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        await prisma_1.default.transaction.update({
            where: {
                uuid: transaction.uuid,
            },
            data: {
                status: 'COMPLETED',
            },
        });
        wallet = await prisma_1.default.wallet.findUnique({
            where: {
                id: transaction.wallet_id,
            },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        balance = wallet.balance;
        switch (order.status) {
            case 'WIN':
                balance += order.amount + order.amount * (order.profit / 100);
                break;
            case 'LOSS':
                break;
            case 'DRAW':
                balance += order.amount;
                break;
            case 'CANCELLED':
                balance += order.amount;
                break;
            case 'PENDING':
                break;
        }
        await prisma_1.default.wallet.update({
            where: {
                id: wallet.id,
            },
            data: {
                balance: balance,
            },
        });
    }
}
exports.updateBinaryOrder = updateBinaryOrder;
