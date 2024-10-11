"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("../../utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getInvestments)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getInvestment)(params.uuid);
    }),
    user: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getUserInvestment)(user.id);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.createInvestment)(user.id, body.plan, body.amount);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        return (0, queries_1.updateInvestment)(Number(params.id), body.data);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.deleteInvestment)(Number(params.id));
    }),
    cancel: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.cancelInvestment)(user.id, params.uuid);
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await (0, queries_1.checkInvestments)();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
