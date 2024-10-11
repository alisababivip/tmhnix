"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries"); // You will need to create these query functions
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        const { type, status, wallet, walletType, basic } = query;
        return await (0, queries_1.getTransactions)(user.id, type, status, wallet, walletType, basic);
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_1.getTransaction)(params.referenceId);
    }),
};
