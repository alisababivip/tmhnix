"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMarket = exports.updateMarketsStatus = exports.updateMarket = exports.createMarket = exports.getMarketBySymbol = exports.getMarket = exports.getMarkets = void 0;
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getMarkets() {
    return prisma_1.default.ecosystem_market.findMany();
}
exports.getMarkets = getMarkets;
async function getMarket(id) {
    return prisma_1.default.ecosystem_market.findUnique({
        where: {
            id: id,
        },
    });
}
exports.getMarket = getMarket;
async function getMarketBySymbol(symbol) {
    return prisma_1.default.ecosystem_market.findUnique({
        where: {
            symbol: symbol,
        },
    });
}
exports.getMarketBySymbol = getMarketBySymbol;
async function createMarket(currency, pair, metadata, is_trending, is_hot) {
    const market = await prisma_1.default.ecosystem_market.findUnique({
        where: {
            symbol: currency + '/' + pair,
        },
    });
    if (market) {
        throw new Error('Market already exists');
    }
    return (await prisma_1.default.ecosystem_market.create({
        data: {
            symbol: currency + '/' + pair,
            pair,
            metadata,
            is_trending,
            is_hot,
            status: true,
        },
    }));
}
exports.createMarket = createMarket;
async function updateMarket(id, metadata, is_trending, is_hot) {
    return (await prisma_1.default.ecosystem_market.update({
        where: {
            id: id,
        },
        data: {
            metadata,
            is_trending,
            is_hot,
        },
    }));
}
exports.updateMarket = updateMarket;
async function updateMarketsStatus(ids, status) {
    await prisma_1.default.ecosystem_market.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
}
exports.updateMarketsStatus = updateMarketsStatus;
async function deleteMarket(id) {
    await prisma_1.default.ecosystem_market.delete({
        where: {
            id: id,
        },
    });
}
exports.deleteMarket = deleteMarket;
