"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrency = exports.getAllCurrencies = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getAllCurrencies() {
    return await prisma_1.default.currency.findMany({
        orderBy: { code: 'asc' },
    });
}
exports.getAllCurrencies = getAllCurrencies;
async function updateCurrency(ids, status) {
    await prisma_1.default.currency.updateMany({
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
exports.updateCurrency = updateCurrency;
