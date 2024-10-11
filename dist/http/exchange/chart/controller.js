"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
// servers/backend/http/exchange/chart/controller.ts
const queries_1 = require("./queries");
const utils_1 = require("~~/utils");
exports.controllers = {
    getHistorical: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return (0, queries_1.getHistoricalOHLCV)(query.symbol, query.interval, query.from, query.to, query.duration);
    }),
};
