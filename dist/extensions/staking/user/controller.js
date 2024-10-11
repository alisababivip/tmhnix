"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const logger_1 = require("../../../logger");
const utils_1 = require("../../../utils");
const queries_1 = require("./queries");
const logger = (0, logger_1.createLogger)('Staking');
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listUserStakes)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        const { id } = params;
        return (0, queries_1.getStakeById)(user.id, Number(id));
    }),
    stake: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { pool_id, amount, duration_id } = body;
        return (0, queries_1.stakeTokens)(user.id, Number(pool_id), Number(amount), Number(duration_id));
    }),
    withdraw: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { stake_id } = body;
        return (0, queries_1.withdrawStake)(user.id, Number(stake_id));
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await (0, queries_1.processStakingLogs)();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
