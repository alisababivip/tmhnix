"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listPools)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getPoolById)(Number(id));
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { name, currency, chain, type, min_stake, max_stake, status, description, } = body;
        return (0, queries_1.createPool)(name, currency, chain, type, Number(min_stake), Number(max_stake), status, description);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { name, currency, chain, type, min_stake, max_stake, status, description, } = body;
        return (0, queries_1.updatePool)(Number(id), name, currency, chain, type, Number(min_stake), Number(max_stake), status, description);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deletePool)(Number(id));
    }),
};
