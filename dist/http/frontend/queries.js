"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrontendSections = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getFrontendSections() {
    return await prisma_1.default.frontend.findMany({
        where: {
            status: true,
        },
    });
}
exports.getFrontendSections = getFrontendSections;
