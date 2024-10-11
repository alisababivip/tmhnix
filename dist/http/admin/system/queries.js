"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExtensionStatusQuery = exports.getExtensionsQuery = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getExtensionsQuery() {
    return (await prisma_1.default.extension.findMany());
}
exports.getExtensionsQuery = getExtensionsQuery;
async function updateExtensionStatusQuery(id, status) {
    return (await prisma_1.default.extension.update({
        where: {
            product_id: id,
        },
        data: {
            status: status,
        },
    }));
}
exports.updateExtensionStatusQuery = updateExtensionStatusQuery;
