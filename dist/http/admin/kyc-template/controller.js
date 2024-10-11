"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getKycTemplates)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_1.getKycTemplate)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createKycTemplate)(body.data);
            return {
                ...response,
                message: 'KYC template created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateKycTemplate)(Number(params.id), body.data);
            return {
                ...response,
                message: 'KYC template updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteKycTemplate)(Number(params.id));
            return {
                message: 'KYC template deleted successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updateKycTemplateStatus)(body.ids, body.status);
            return {
                message: 'KYC template status updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
