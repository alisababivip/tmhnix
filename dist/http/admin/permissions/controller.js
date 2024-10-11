"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("./queries");
// Function to cache the permissions
async function cachePermissions() {
    const permissions = await (0, queries_1.getPermissions)();
    await redis_1.redis.set('permissions', JSON.stringify(permissions), 'EX', 3600);
}
// Initialize the cache when the file is loaded
cachePermissions();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedPermissions = await redis_1.redis.get('permissions');
            if (cachedPermissions)
                return JSON.parse(cachedPermissions);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPermissions)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedPermissions = await redis_1.redis.get('permissions');
            if (cachedPermissions) {
                const permissions = JSON.parse(cachedPermissions);
                const permission = permissions.find((p) => p.id === Number(params.id));
                if (permission)
                    return permission;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPermission)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createPermission)(body.permission);
            await cachePermissions();
            return {
                ...response,
                message: 'Permission created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updatePermission)(Number(params.id), body.permission);
            await cachePermissions();
            return {
                ...response,
                message: 'Permission updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await (0, queries_1.deletePermission)(Number(params.id));
            await cachePermissions();
            return {
                message: 'Permission remvoed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
