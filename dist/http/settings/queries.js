"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtensionsQuery = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
async function getSettings() {
    return await prisma_1.default.settings.findMany({
        select: {
            key: true,
            value: true,
        },
    });
}
exports.getSettings = getSettings;
async function getExtensionsQuery() {
    return (await prisma_1.default.extension.findMany({
        where: {
            status: true,
        },
        select: {
            id: true,
            name: true,
            status: true,
        },
    }));
}
exports.getExtensionsQuery = getExtensionsQuery;
