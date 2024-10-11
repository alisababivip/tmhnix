"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePage = exports.updatePage = exports.createPage = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function createPage(data) {
    // Initial slug generation based on the title
    let slug = data.title.toLowerCase().replace(/\s+/g, '-');
    // Initialize a variable to keep track of how many times this slug has been used
    let slugCount = 0;
    // Check if the generated slug already exists
    const existingPage = await prisma_1.default.page.findFirst({
        where: {
            slug: {
                startsWith: slug,
            },
        },
        orderBy: {
            slug: 'desc',
        },
        select: {
            slug: true,
        },
    });
    if (existingPage) {
        const match = existingPage.slug.match(/-(\d+)$/);
        slugCount = match ? parseInt(match[1], 10) : 0;
        slugCount++;
    }
    // If slug exists, append a number to make it unique
    if (slugCount > 0) {
        slug = `${slug}-${slugCount}`;
    }
    return await prisma_1.default.page.create({
        data: {
            title: data.title,
            slug: slug,
            description: data.description,
            content: data.content,
            image: data.image,
            status: data.status,
        },
    });
}
exports.createPage = createPage;
async function updatePage(id, data) {
    return await prisma_1.default.page.update({
        where: { id: id },
        data,
    });
}
exports.updatePage = updatePage;
async function deletePage(id) {
    return await prisma_1.default.page.delete({
        where: { id: id },
    });
}
exports.deletePage = deletePage;
