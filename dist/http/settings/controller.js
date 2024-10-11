"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = exports.cacheSettings = void 0;
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("./queries");
async function cacheSettings() {
    const settings = await (0, queries_1.getSettings)();
    await redis_1.redis.set('settings', JSON.stringify(settings), 'EX', 1800); // Cache for 30 minutes
}
exports.cacheSettings = cacheSettings;
cacheSettings();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedSettings = await redis_1.redis.get('settings');
            if (cachedSettings)
                return JSON.parse(cachedSettings);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getSettings)();
    }),
    extensions: (0, utils_1.handleController)(async () => {
        const extensions = await (0, queries_1.getExtensionsQuery)();
        return extensions.reduce((acc, curr) => {
            acc[curr.name] = curr.status;
            return acc;
        }, {});
    }),
};
