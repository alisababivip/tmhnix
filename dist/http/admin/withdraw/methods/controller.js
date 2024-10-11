"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const wallet = await (0, queries_1.createWithdrawMethod)(body.data);
            return {
                ...wallet,
                message: 'Withraw method created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const wallet = (0, queries_1.updateWithdrawMethod)(Number(params.id), body.data);
            return {
                ...wallet,
                message: 'Withraw method updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteWithdrawMethod)(Number(params.id));
            return {
                message: 'Withraw method deleted successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updateWithdrawMethodStatus)(body.ids, body.status);
            return {
                message: 'Withraw method status updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
