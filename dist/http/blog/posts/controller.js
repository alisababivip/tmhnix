"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
const redis_1 = require("~~/utils/redis");
// Function to cache the posts
async function cachePosts() {
    const posts = await (0, queries_1.getPosts)();
    await redis_1.redis.set('posts', JSON.stringify(posts), 'EX', 3600);
}
// Initialize the cache when the file is loaded
cachePosts();
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        try {
            const cachedPosts = await redis_1.redis.get('posts');
            if (cachedPosts)
                return JSON.parse(cachedPosts);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPosts)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedPosts = await redis_1.redis.get('posts');
            if (cachedPosts) {
                const posts = JSON.parse(cachedPosts);
                const post = posts.find((p) => p.id === Number(params.id));
                if (post)
                    return post;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPost)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        const newPost = await (0, queries_1.createPost)(user.id, body.post);
        cachePosts(); // Update the cache
        return newPost;
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        if (!user)
            throw new Error('User not found');
        const updatedPost = await (0, queries_1.updatePost)(user.id, params.slug, body.post);
        cachePosts(); // Update the cache
        return updatedPost;
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const updatedPost = await (0, queries_1.updatePostStatus)(Number(params.id), body.status);
        cachePosts(); // Update the cache
        return updatedPost;
    }),
    delete: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        const deletedPost = await (0, queries_1.deletePost)(user.id, Number(params.id));
        cachePosts(); // Update the cache
        return deletedPost;
    }),
};
