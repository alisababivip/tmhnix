"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const logger_1 = require("~~/logger");
const utils_1 = require("../../../../utils");
const blockchain_1 = require("../../utils/blockchain");
const queries_1 = require("../../utils/scylla/queries");
const queries_2 = require("./queries");
const logger = (0, logger_1.createLogger)('Ecosystem Market Controller');
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_2.getMarkets)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_2.getMarket)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { currency, pair, metadata, is_trending, is_hot } = body;
        const response = await (0, queries_2.createMarket)(currency, pair, metadata, is_trending, is_hot);
        return response;
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const { metadata, is_hot, is_trending } = body;
        const response = await (0, queries_2.updateMarket)(Number(params.id), metadata, is_trending, is_hot);
        return response;
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        await (0, queries_2.updateMarketsStatus)(body.ids, body.status);
        return {
            message: 'Markets updated successfully',
        };
    }),
    destroy: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const market = await (0, queries_2.getMarket)(Number(params.id));
            if (!market)
                throw new Error('Market not found');
            await (0, queries_1.deleteAllMarketData)(market.symbol);
            await (0, queries_2.deleteMarket)(Number(params.id));
            return {
                message: 'Market deleted successfully',
            };
        }
        catch (error) {
            throw new Error(`Market deletion failed: ${error.message}`);
        }
    }),
    orders: (0, utils_1.handleController)(async (_, __, ___, query) => {
        try {
            // Destructure the required query parameters
            const { user, symbol, status, side } = query;
            // Fetch the orders based on the query parameters
            const orders = await (0, queries_1.getOrdersByParams)(user, symbol, status, side);
            // Convert BigInt to String (or any other transformation you need)
            const ordersBigIntToString = orders.map((order) => ({
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
};
