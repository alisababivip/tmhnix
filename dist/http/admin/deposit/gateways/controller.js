"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateDepositGateway)(Number(params.id), body.data);
            return {
                ...response,
                message: 'Deposit gateway updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { ids, status } = body;
            await (0, queries_1.updateDepositGatewayStatus)(ids, status);
            return {
                message: 'Deposit gateways updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
