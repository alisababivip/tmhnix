"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletQuery = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getOrders(userId) {
    return prisma_1.default.exchange_orders.findMany({
        where: {
            user_id: userId,
        },
    });
}
exports.getOrders = getOrders;
async function getOrder(uuid) {
    return prisma_1.default.exchange_orders.findUnique({
        where: {
            uuid: uuid,
        },
    });
}
exports.getOrder = getOrder;
const mapOrderDataToPrismaModel = (order) => {
    return {
        uuid: (0, passwords_1.makeUuid)(),
        reference_id: order.reference_id,
        status: order.status ? order.status.toUpperCase() : undefined,
        symbol: order.symbol,
        type: order.type ? order.type.toUpperCase() : undefined,
        timeInForce: order.timeInForce
            ? order.timeInForce.toUpperCase()
            : undefined,
        side: order.side ? order.side.toUpperCase() : undefined,
        price: Number(order.price),
        average: Number(order.average) || undefined,
        amount: Number(order.amount),
        filled: Number(order.filled),
        remaining: Number(order.remaining),
        cost: Number(order.cost),
        trades: order.trades,
        fee: order.fee,
        fee_currency: order.fee_currency,
    };
};
async function createOrder(userId, order) {
    const mappedOrder = mapOrderDataToPrismaModel(order);
    return prisma_1.default.exchange_orders.create({
        data: {
            ...mappedOrder,
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
}
exports.createOrder = createOrder;
async function updateOrder(uuid, data) {
    await prisma_1.default.exchange_orders.update({
        where: {
            uuid: uuid,
        },
        data: data,
    });
}
exports.updateOrder = updateOrder;
async function updateWalletQuery(id, data) {
    return prisma_1.default.wallet.update({
        where: {
            id: id,
        },
        data: data,
    });
}
exports.updateWalletQuery = updateWalletQuery;
