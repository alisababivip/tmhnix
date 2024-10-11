"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = exports.cacheFrontendSections = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
const redis_1 = require("~~/utils/redis");
async function cacheFrontendSections() {
    const frontendSections = await (0, queries_1.getFrontendSections)();
    await redis_1.redis.set('frontendSections', JSON.stringify(frontendSections), 'EX', 43200); // Cache for 12 hours
}
exports.cacheFrontendSections = cacheFrontendSections;
cacheFrontendSections();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedFrontendSections = await redis_1.redis.get('frontendSections');
            if (cachedFrontendSections)
                return JSON.parse(cachedFrontendSections);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getFrontendSections)();
    }),
};
