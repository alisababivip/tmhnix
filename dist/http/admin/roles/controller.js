"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("./queries");
// Function to cache the roles
async function cacheRoles() {
    const roles = await (0, queries_1.getRoles)();
    await redis_1.redis.set('roles', JSON.stringify(roles), 'EX', 3600);
}
// Initialize the cache when the file is loaded
cacheRoles();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedRoles = await redis_1.redis.get('roles');
            if (cachedRoles)
                return JSON.parse(cachedRoles);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getRoles)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedRoles = await redis_1.redis.get('roles');
            if (cachedRoles) {
                const roles = JSON.parse(cachedRoles);
                const role = roles.find((r) => r.id === Number(params.id));
                if (role)
                    return role;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getRole)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createRole)(body.role);
            await cacheRoles();
            return {
                ...response,
                message: 'Role created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updateRole)(Number(params.id), body.role);
            await cacheRoles();
            return {
                ...response,
                message: 'Role updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deleteRole)(Number(params.id));
            await cacheRoles();
            return {
                message: 'Role removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    deleteBulk: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.deleteRoles)(body.ids);
            await cacheRoles();
            return {
                message: 'Roles removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    syncPermissions: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.syncPermissions)(Number(params.id), body.permissionIds);
            await cacheRoles();
            return {
                ...response,
                message: 'Role permissions synced successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
