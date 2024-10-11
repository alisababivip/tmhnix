"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const controller_1 = require("~~/http/currencies/controller");
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getAllCurrencies)();
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { ids, status } = body;
            await (0, queries_1.updateCurrency)(ids, status);
            await (0, controller_1.cacheCurrencies)();
            return {
                message: 'Currencies updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
