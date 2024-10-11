"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries"); // Make sure these functions exist in your queries file
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        return (0, queries_1.getWatchlists)(user.id);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user) {
            throw new Error('User not found');
        }
        return (0, queries_1.createWatchlist)(user.id, body.symbol, body.type);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.deleteWatchlist)(Number(params.id));
    }),
};
