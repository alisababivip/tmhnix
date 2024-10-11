"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    depositMethods: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getDepositMethods)();
    }),
    depositMethod: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getDepositMethod)(params.id);
    }),
    depositGateways: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getDepositGateways)();
    }),
    depositGateway: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getDepositGateway)(params.id);
    }),
    withdrawMethods: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getWithdrawMethods)();
    }),
    withdrawMethod: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getWithdrawMethod)(params.id);
    }),
    deposit: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.depositFiat)(user.id, body.transaction, body.currency);
    }),
    withdraw: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const response = (0, queries_1.withdrawFiat)(user.id, body.wallet, body.methodId, body.amount, body.total, body.custom_data);
            return {
                ...response,
                message: 'Withdrawal request sent successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    customDeposit: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.customFiatDepositMethod)(user.id, body.wallet, body.methodId, body.amount, body.total, body.custom_data);
    }),
};
