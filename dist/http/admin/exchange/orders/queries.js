"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.getOrders = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getUserID(userUuid) {
    const user = await prisma_1.default.user.findUnique({
        where: { uuid: userUuid },
    });
    if (!user)
        throw new Error('Invalid user UUID');
    return user.id;
}
async function getOrders(userUuid, type, status, side, currency) {
    // Determine the user ID and wallet ID if uuids are provided
    const userId = userUuid ? await getUserID(userUuid) : undefined;
    // Define the where clause based on the provided parameters
    const where = {
        user_id: userId,
        status,
        side,
    };
    // Include wallet and user details in the query
    const include = {
        user: {
            select: {
                first_name: true,
                last_name: true,
                uuid: true,
                avatar: true,
            },
        },
    };
    let orders = [];
    // Query the orders based on the where clause and include the wallet and user details
    if (type === 'trade') {
        orders = (await prisma_1.default.exchange_orders.findMany({
            where,
            include,
        }));
    }
    else {
        orders = (await prisma_1.default.binary_orders.findMany({
            where,
            include,
        }));
    }
    if (currency && orders.length > 0) {
        return orders.filter((order) => {
            return order.symbol.split('/')[1] === currency;
        });
    }
    return orders;
}
exports.getOrders = getOrders;
async function getOrder(uuid, type) {
    const order = type === 'trade'
        ? (await prisma_1.default.exchange_orders.findUnique({
            where: {
                uuid,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        uuid: true,
                        avatar: true,
                    },
                },
            },
        }))
        : (await prisma_1.default.binary_orders.findUnique({
            where: {
                uuid,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        uuid: true,
                        avatar: true,
                    },
                },
            },
        }));
    return order;
}
exports.getOrder = getOrder;
