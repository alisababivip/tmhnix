"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = exports.cachePages = void 0;
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("./queries");
async function cachePages() {
    const pages = await (0, queries_1.getPages)();
    await redis_1.redis.set('pages', JSON.stringify(pages), 'EX', 43200); // Cache for 12 hours (720 * 60)
}
exports.cachePages = cachePages;
cachePages();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedPages = await redis_1.redis.get('pages');
            if (cachedPages)
                return JSON.parse(cachedPages);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPages)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedPages = await redis_1.redis.get('pages');
            if (cachedPages) {
                const pages = JSON.parse(cachedPages);
                const page = pages.find((p) => p.id === Number(params.id));
                if (page)
                    return page;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPage)(Number(params.id));
    }),
};
