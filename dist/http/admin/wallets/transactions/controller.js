"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries"); // You will need to create these query functions
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { user, type, status, wallet, walletType, basic } = query;
        return await (0, queries_1.getAdminTransactions)(user, type, status, wallet, walletType, basic);
    }),
};
