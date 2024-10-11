"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const controller_1 = require("~~/http/frontend/controller");
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getFrontendSections)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getFrontendSection)(Number(params.id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateFrontendSection)(Number(params.id), body.section);
            await (0, controller_1.cacheFrontendSections)();
            return {
                ...response,
                message: 'Frontend section updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updateFrontendSectionStatus)(body.ids, body.status);
            await (0, controller_1.cacheFrontendSections)();
            return {
                message: 'Frontend section status updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
