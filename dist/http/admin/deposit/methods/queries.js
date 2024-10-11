"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDepositMethod = exports.updateDepositMethodStatus = exports.updateDepositMethod = exports.createDepositMethod = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function createDepositMethod(depositMethodData) {
    return (await prisma_1.default.deposit_method.create({
        data: depositMethodData,
    }));
}
exports.createDepositMethod = createDepositMethod;
async function updateDepositMethod(id, depositMethodData) {
    return (await prisma_1.default.deposit_method.update({
        where: { id },
        data: depositMethodData,
    }));
}
exports.updateDepositMethod = updateDepositMethod;
async function updateDepositMethodStatus(ids, status) {
    await prisma_1.default.deposit_method.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
}
exports.updateDepositMethodStatus = updateDepositMethodStatus;
async function deleteDepositMethod(id) {
    await prisma_1.default.deposit_method.delete({ where: { id } });
}
exports.deleteDepositMethod = deleteDepositMethod;
