"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return await (0, queries_1.getNotifications)(user.id);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return await (0, queries_1.createNotification)(user.id, body.notification);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return await (0, queries_1.deleteNotification)(user.id, Number(params.id));
    }),
};
