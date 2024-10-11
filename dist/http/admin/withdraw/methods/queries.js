"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWithdrawMethod = exports.updateWithdrawMethodStatus = exports.updateWithdrawMethod = exports.createWithdrawMethod = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function createWithdrawMethod(withdrawMethodData) {
    return (await prisma_1.default.withdraw_method.create({
        data: withdrawMethodData,
    }));
}
exports.createWithdrawMethod = createWithdrawMethod;
async function updateWithdrawMethod(id, withdrawMethodData) {
    return (await prisma_1.default.withdraw_method.update({
        where: { id },
        data: withdrawMethodData,
    }));
}
exports.updateWithdrawMethod = updateWithdrawMethod;
async function updateWithdrawMethodStatus(ids, status) {
    await prisma_1.default.withdraw_method.updateMany({
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
exports.updateWithdrawMethodStatus = updateWithdrawMethodStatus;
async function deleteWithdrawMethod(id) {
    await prisma_1.default.withdraw_method.delete({ where: { id } });
}
exports.deleteWithdrawMethod = deleteWithdrawMethod;
