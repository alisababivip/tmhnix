"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getKycs)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_1.getKyc)(Number(params.id));
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteKyc)(Number(params.id));
            return {
                message: 'KYC application removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateKycStatus)(Number(params.id), body.status, body.message);
            return {
                ...response,
                message: 'KYC application updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
