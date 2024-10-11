"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries"); // Make sure these functions exist in your queries file
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getKyc)(user.id);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.createKyc)(user.id, body.templateId, body.template, body.level);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        return (0, queries_1.updateKyc)(Number(params.id), body.updatedData);
    }),
};
