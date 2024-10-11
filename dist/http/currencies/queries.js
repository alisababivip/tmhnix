"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrencyRates = exports.getCurrency = exports.getCurrencies = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// Constants for Error Messages
const CURRENCY_NOT_FOUND = 'Currency not found';
// Helper Functions
async function findCurrencyById(id) {
    const currency = await prisma_1.default.currency.findUnique({
        where: { id },
    });
    if (!currency)
        throw new Error(CURRENCY_NOT_FOUND);
    return currency;
}
async function getCurrencies() {
    return await prisma_1.default.currency.findMany({
        where: { status: true },
        orderBy: { code: 'asc' },
    });
}
exports.getCurrencies = getCurrencies;
async function getCurrency(id) {
    return await findCurrencyById(id);
}
exports.getCurrency = getCurrency;
async function updateCurrencyRates(rates) {
    const updatePromises = Object.keys(rates).map((code) => {
        return prisma_1.default.currency.updateMany({
            where: { code },
            data: {
                price: rates[code],
            },
        });
    });
    await Promise.all(updatePromises);
}
exports.updateCurrencyRates = updateCurrencyRates;
