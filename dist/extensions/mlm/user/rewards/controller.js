"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listMyRewards)(user.id);
    }),
    claim: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        const { uuid } = params;
        return (0, queries_1.claimReward)(user.id, uuid);
    }),
};
