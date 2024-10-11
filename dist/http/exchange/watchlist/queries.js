"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWatchlist = exports.createWatchlist = exports.getWatchlists = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getWatchlists(userId) {
    return (await prisma_1.default.exchange_watchlist.findMany({
        where: {
            user_id: userId,
        },
    }));
}
exports.getWatchlists = getWatchlists;
async function createWatchlist(userId, symbol, type) {
    if (!symbol || !type) {
        throw new Error('Missing required parameters: symbol, or type.');
    }
    const existingWatchlist = await prisma_1.default.exchange_watchlist.findFirst({
        where: {
            user_id: userId,
            symbol,
            type,
        },
    });
    if (existingWatchlist) {
        // If a watchlist with the same userId, type, and symbol already exists, remove it
        await prisma_1.default.exchange_watchlist.delete({
            where: {
                id: existingWatchlist.id,
            },
        });
        return;
    }
    // Otherwise, create a new watchlist entry
    return (await prisma_1.default.exchange_watchlist.create({
        data: {
            user_id: userId,
            symbol,
            type,
        },
    }));
}
exports.createWatchlist = createWatchlist;
async function deleteWatchlist(id) {
    await prisma_1.default.exchange_watchlist.delete({
        where: {
            id,
        },
    });
}
exports.deleteWatchlist = deleteWatchlist;
