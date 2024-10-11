"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getPlans)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return await (0, queries_1.getPlan)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createPlan)(body.plan);
            return {
                ...response,
                message: 'Investment plan created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updatePlan)(Number(params.id), body.plan);
            return {
                ...response,
                message: 'Investment plan updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await await (0, queries_1.deletePlan)(Number(params.id));
            return {
                message: 'Investment plan removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updatePlanStatus)(body.ids, body.status);
            return {
                message: 'Investment plan updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
