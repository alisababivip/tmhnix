"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuthor = exports.updateAuthor = exports.createAuthor = exports.getAuthor = exports.getAuthors = void 0;
const emails_1 = require("~~/utils/emails");
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const userInclude = {
    select: {
        id: true,
        uuid: true,
        first_name: true,
        last_name: true,
        avatar: true,
    },
};
async function getAuthors(posts, status) {
    const where = {};
    if (status) {
        where['status'] = status;
    }
    return prisma_1.default.author.findMany({
        where,
        include: {
            user: userInclude,
            posts: posts ? true : false,
        },
    });
}
exports.getAuthors = getAuthors;
async function getAuthor(id, posts) {
    return await prisma_1.default.author.findUnique({
        where: { id },
        include: {
            user: userInclude,
            posts: posts,
        },
    });
}
exports.getAuthor = getAuthor;
async function createAuthor(userId) {
    return await prisma_1.default.author.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user: {
                connect: {
                    id: userId,
                },
            },
            status: 'PENDING',
        },
    });
}
exports.createAuthor = createAuthor;
async function updateAuthor(id, status) {
    const updatedAuthor = await prisma_1.default.author.update({
        where: { id },
        data: { status: status },
    });
    // Fetch user information for email
    const user = await prisma_1.default.user.findUnique({
        where: { id: updatedAuthor.user_id },
    });
    if (user) {
        await (0, emails_1.sendAuthorStatusUpdateEmail)(user, updatedAuthor);
    }
    return updatedAuthor;
}
exports.updateAuthor = updateAuthor;
async function deleteAuthor(id) {
    return await prisma_1.default.author.delete({
        where: { id },
    });
}
exports.deleteAuthor = deleteAuthor;
