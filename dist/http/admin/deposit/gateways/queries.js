"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepositGatewayStatus = exports.updateDepositGateway = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function updateDepositGateway(id, depositGatewayData) {
    return prisma_1.default.deposit_gateway.update({
        where: { id },
        data: depositGatewayData,
    });
}
exports.updateDepositGateway = updateDepositGateway;
async function updateDepositGatewayStatus(ids, status) {
    await prisma_1.default.deposit_gateway.updateMany({
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
exports.updateDepositGatewayStatus = updateDepositGatewayStatus;
