"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return (0, queries_1.getAuthors)(query.posts, query.status);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, query) => {
        return (0, queries_1.getAuthor)(Number(params.id), query.posts);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.createAuthor)(user.id);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        return (0, queries_1.updateAuthor)(Number(params.id), body.status);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.deleteAuthor)(Number(params.id));
    }),
};
