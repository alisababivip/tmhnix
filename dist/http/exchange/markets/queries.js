"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarketsStatus = exports.updateMarket = exports.getMarket = exports.getMarkets = void 0;
const prisma_1 = __importDefault(require("../../../utils/prisma"));
async function getMarkets() {
    return prisma_1.default.exchange_market.findMany();
}
exports.getMarkets = getMarkets;
async function getMarket(id) {
    return prisma_1.default.exchange_market.findUnique({
        where: {
            id: id,
        },
    });
}
exports.getMarket = getMarket;
async function updateMarket(id, metadata, is_trending, is_hot) {
    // Check if the market exists
    const existingMarket = await prisma_1.default.exchange_market.findUnique({
        where: {
            id: id,
        },
    });
    if (!existingMarket) {
        throw new Error('Market not found');
    }
    // Initialize an empty object for updatedMetadata
    let updatedMetadata = {};
    // Check if existingMetadata is actually an object
    if (existingMarket.metadata &&
        typeof existingMarket.metadata === 'object' &&
        !Array.isArray(existingMarket.metadata)) {
        // Merge existing metadata with new metadata (only 'taker' and 'maker')
        updatedMetadata = {
            ...existingMarket.metadata,
            taker: metadata.taker,
            maker: metadata.maker,
        };
    }
    else {
        // If it's not an object, just use the new 'taker' and 'maker'
        updatedMetadata = {
            taker: metadata.taker,
            maker: metadata.maker,
        };
    }
    // Perform the update with the updated metadata
    return (await prisma_1.default.exchange_market.update({
        where: {
            id: id,
        },
        data: {
            metadata: updatedMetadata,
            is_trending: is_trending,
            is_hot: is_hot,
        },
    }));
}
exports.updateMarket = updateMarket;
async function updateMarketsStatus(ids, status) {
    await prisma_1.default.exchange_market.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
    return true;
}
exports.updateMarketsStatus = updateMarketsStatus;
