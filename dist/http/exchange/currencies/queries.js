"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrencyChains = exports.updateCurrencyPricesBulk = exports.updateCurrenciesStatus = exports.updateCurrency = exports.getCurrency = exports.getCurrencies = void 0;
const prisma_1 = __importDefault(require("../../../utils/prisma"));
async function getCurrencies() {
    return prisma_1.default.exchange_currency.findMany();
}
exports.getCurrencies = getCurrencies;
async function getCurrency(id) {
    return prisma_1.default.exchange_currency.findUnique({
        where: {
            id: id,
        },
    });
}
exports.getCurrency = getCurrency;
async function updateCurrency(id, currencyData) {
    return (await prisma_1.default.exchange_currency.update({
        where: {
            id: id,
        },
        data: currencyData,
    }));
}
exports.updateCurrency = updateCurrency;
async function updateCurrenciesStatus(ids, status) {
    await prisma_1.default.exchange_currency.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
    return true;
}
exports.updateCurrenciesStatus = updateCurrenciesStatus;
async function updateCurrencyPricesBulk(data) {
    const updateQueries = data.map((item) => {
        return prisma_1.default.exchange_currency.updateMany({
            where: { id: item.id },
            data: { price: item.price },
        });
    });
    try {
        await prisma_1.default.$transaction(updateQueries);
        console.log('Bulk update successful');
    }
    catch (error) {
        console.error('Bulk update failed:', error);
        throw error;
    }
}
exports.updateCurrencyPricesBulk = updateCurrencyPricesBulk;
async function updateCurrencyChains(id, chains) {
    return (await prisma_1.default.exchange_currency.update({
        where: {
            id: id,
        },
        data: {
            chains: chains,
        },
    }));
}
exports.updateCurrencyChains = updateCurrencyChains;
