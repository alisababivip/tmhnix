"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { filter, perPage, page } = query;
        const perPageNumber = perPage ? parseInt(perPage, 10) : 10;
        const pageNumber = page ? parseInt(page, 10) : 1;
        return await (0, queries_1.getUsers)(filter, perPageNumber, pageNumber);
    }),
    fetch: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getAllUsers)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getUser)(params.uuid);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        try {
            const { uuid } = params;
            const { first_name, last_name, email, role_id } = body;
            const response = await (0, queries_1.updateUser)(uuid, user.id, first_name, last_name, email, Number(role_id));
            return {
                ...response,
                message: 'User updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteUser)(params.uuid);
            return {
                message: 'User removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    deleteBulk: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.deleteUsers)(body.users);
            return {
                message: 'Users removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updateUsersStatus)(body.users, body.status);
            return {
                message: 'Users updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    analytics: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getUserCountsPerDay)();
    }),
};
