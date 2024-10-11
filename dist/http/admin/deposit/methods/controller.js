"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, queries_1.createDepositMethod)(body.data);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateDepositMethod)(Number(params.id), body.data);
            return {
                ...response,
                message: 'Deposit method updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteDepositMethod)(Number(params.id));
            return {
                message: 'Deposit method removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updateDepositMethodStatus)(body.ids, body.status);
            return {
                message: 'Deposit methods updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
