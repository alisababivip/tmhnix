"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const controller_1 = require("~~/http/pages/controller");
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createPage)(body.data);
            await (0, controller_1.cachePages)();
            return {
                ...response,
                message: 'Page created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updatePage)(Number(params.id), body.data);
            await (0, controller_1.cachePages)();
            return {
                ...response,
                message: 'Page updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deletePage)(Number(params.id));
            await (0, controller_1.cachePages)();
            return {
                message: 'Page removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
