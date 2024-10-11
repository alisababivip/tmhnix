"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketBySymbol = exports.getMarket = exports.getMarkets = void 0;
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getMarkets() {
    return prisma_1.default.ecosystem_market.findMany({
        where: {
            status: true,
        },
    });
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
            symbol,
        },
    });
}
exports.getMarketBySymbol = getMarketBySymbol;
