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
};
