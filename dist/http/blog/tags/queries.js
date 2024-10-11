"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTag = exports.getTags = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const postInclude = {
    post_tag: {
        select: {
            post: {
                include: {
                    author: {
                        include: {
                            user: true,
                        },
                    },
                    category: true,
                },
            },
        },
    },
};
async function getTags(posts) {
    const include = posts ? postInclude : {};
    const tags = await prisma_1.default.tag.findMany();
    if (tags.length === 0) {
        await prisma_1.default.tag.create({
            data: {
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        });
    }
    return await prisma_1.default.tag.findMany({
        include: posts ? include : undefined,
    });
}
exports.getTags = getTags;
async function getTag(slug, posts) {
    const include = posts ? postInclude : {};
    return await prisma_1.default.tag.findUnique({
        where: { slug: slug },
        include: posts ? include : undefined,
    });
}
exports.getTag = getTag;
async function createTag(data) {
    return await prisma_1.default.tag.create({
        data,
    });
}
exports.createTag = createTag;
async function updateTag(id, data) {
    return await prisma_1.default.tag.update({
        where: { id },
        data,
    });
}
exports.updateTag = updateTag;
async function deleteTag(id) {
    return await prisma_1.default.tag.delete({
        where: { id },
    });
}
exports.deleteTag = deleteTag;
