"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const postInclude = {
    post: {
        include: {
            author: {
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    },
};
async function getCategories(posts) {
    const include = posts ? postInclude : {};
    const categories = await prisma_1.default.category.findMany();
    if (categories.length === 0) {
        await prisma_1.default.category.create({
            data: {
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        });
    }
    return await prisma_1.default.category.findMany({
        include: posts ? include : undefined,
    });
}
exports.getCategories = getCategories;
async function getCategory(id, posts) {
    const include = posts ? postInclude : {};
    return await prisma_1.default.category.findUnique({
        where: { id },
        include: posts ? include : undefined,
    });
}
exports.getCategory = getCategory;
async function createCategory(data) {
    return await prisma_1.default.category.create({
        data,
    });
}
exports.createCategory = createCategory;
async function updateCategory(id, data) {
    return await prisma_1.default.category.update({
        where: { id },
        data,
    });
}
exports.updateCategory = updateCategory;
async function deleteCategory(id) {
    return await prisma_1.default.category.delete({
        where: { id },
    });
}
exports.deleteCategory = deleteCategory;
