"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getDurations)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getDuration)(Number(id));
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { pool_id, duration, interest_rate } = body;
        return (0, queries_1.createDuration)(Number(pool_id), Number(duration), Number(interest_rate));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { duration, interest_rate } = body;
        return (0, queries_1.updateDuration)(Number(id), Number(duration), Number(interest_rate));
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteDuration)(Number(id));
    }),
};
