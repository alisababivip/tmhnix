"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermission = exports.getPermissions = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPermissions() {
    return (await prisma_1.default.permission.findMany({
        include: {
            rolepermission: true,
        },
    }));
}
exports.getPermissions = getPermissions;
async function getPermission(id) {
    return (await prisma_1.default.permission.findUnique({
        where: {
            id: id,
        },
    }));
}
exports.getPermission = getPermission;
async function createPermission(data) {
    return (await prisma_1.default.permission.create({
        data: data,
    }));
}
exports.createPermission = createPermission;
async function updatePermission(id, data) {
    return (await prisma_1.default.permission.update({
        where: {
            id: id,
        },
        data: data,
    }));
}
exports.updatePermission = updatePermission;
async function deletePermission(id) {
    await prisma_1.default.permission.delete({
        where: {
            id: id,
        },
    });
}
exports.deletePermission = deletePermission;
