"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query, _____, user) => {
        const { transactions } = query;
        return await (0, queries_1.getWallets)(user.id, transactions === 'true');
    }),
    show: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        return await (0, queries_1.getWallet)(query.uuid);
    }),
    fetch: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        const { currency, type } = query;
        return await (0, queries_1.fetchWallet)(user.id, currency, type);
    }),
    fetchType: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        const { type, transactions } = query;
        return await (0, queries_1.fetchWalletsByType)(user.id, type, transactions === 'true');
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const wallet = await (0, queries_1.createWallet)(user.id, body.currency, body.type);
        return {
            message: 'Wallet created successfully',
            wallet,
        };
    }),
    balance: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return await (0, queries_1.getWallet)(query.uuid);
    }),
    transactions: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return await (0, queries_1.getTransactions)(query.uuid);
    }),
    transfer: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        const { currency, type, amount, to } = body;
        return await (0, queries_1.transferFunds)(user.id, currency, type, amount, to);
    }),
};
