"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listMyReferrals)(user.id);
    }),
    list: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listReferrals)(user.id);
    }),
    analytics: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return await (0, queries_1.getAnalyticsPerDay)(user.id);
    }),
};
