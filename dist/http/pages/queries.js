"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPage = exports.getPages = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPages() {
    return prisma_1.default.page.findMany();
}
exports.getPages = getPages;
async function getPage(id) {
    return (await prisma_1.default.page.findUnique({
        where: { id },
    }));
}
exports.getPage = getPage;
