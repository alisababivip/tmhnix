"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getAllReferrals)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getReferralById)(id);
    }),
    nodes: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getAllNodes)();
    }),
    node: (0, utils_1.handleController)(async (_, __, params) => {
        const { uuid } = params;
        return (0, queries_1.getNodeById)(uuid);
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { status } = body;
        return (0, queries_1.updateReferralStatus)(id, status);
    }),
    referralStats: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getReferralStats)();
    }),
};
