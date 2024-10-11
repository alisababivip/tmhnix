"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { user, type, status, side, currency } = query;
        return await (0, queries_1.getOrders)(user, type, status, side, currency);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, query) => {
        const { type } = query;
        const { uuid } = params;
        return await (0, queries_1.getOrder)(uuid, type);
    }),
};
