"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveLicense = exports.getExchangeDetails = exports.saveExchangeMarkets = void 0;
const controller_1 = require("~~/http/exchange/currencies/controller");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function saveValidCurrencies(currencies) {
    const validCurrencies = [];
    const batchUpsertCurrencies = [];
    for (const currencyCode in currencies) {
        const currencyData = currencies[currencyCode];
        if (currencyData.precision) {
            const validChains = currencyData.chains.filter((chain) => chain.depositStatus === true && chain.withdrawStatus === true);
            if (validChains.length > 0) {
                batchUpsertCurrencies.push(prisma_1.default.exchange_currency.upsert({
                    where: { currency: currencyCode },
                    create: {
                        currency: currencyCode,
                        name: currencyData.name,
                        precision: currencyData.precision,
                        status: currencyData.status,
                        chains: validChains,
                    },
                    update: {
                        name: currencyData.name,
                        precision: currencyData.precision,
                        status: currencyData.status,
                        chains: validChains,
                    },
                }));
                validCurrencies.push(currencyCode);
            }
        }
    }
    await prisma_1.default.$transaction(batchUpsertCurrencies);
    return validCurrencies;
}
async function saveValidMarkets(validCurrencies, symbols) {
    const batchUpsertMarkets = [];
    for (const symbolKey in symbols) {
        const [currency, pair] = symbolKey.split('/');
        if (validCurrencies.includes(currency)) {
            const symbolData = symbols[symbolKey];
            batchUpsertMarkets.push(prisma_1.default.exchange_market.upsert({
                where: { symbol: symbolKey },
                create: {
                    symbol: symbolKey,
                    pair: pair,
                    metadata: symbolData,
                    status: true,
                },
                update: {
                    metadata: symbolData,
                },
            }));
        }
    }
    await prisma_1.default.$transaction(batchUpsertMarkets);
}
async function saveExchangeMarkets(symbols, currencies) {
    try {
        // Step 1: Fetch existing markets
        const existingMarkets = await prisma_1.default.exchange_market.findMany({
            select: { symbol: true },
        });
        const existingMarketSymbols = new Set(existingMarkets.map((m) => m.symbol));
        // Step 2: Determine markets to delete
        const newMarketSymbols = new Set(Object.keys(symbols));
        const marketsToDelete = [...existingMarketSymbols].filter((x) => !newMarketSymbols.has(x));
        // Step 3: Begin transaction
        const transaction = [];
        // Step 4: Delete unwanted markets
        transaction.push(prisma_1.default.exchange_market.deleteMany({
            where: { symbol: { in: marketsToDelete } },
        }));
        // Step 5: Delete orders associated with deleted markets
        transaction.push(prisma_1.default.exchange_orders.deleteMany({
            where: { symbol: { in: marketsToDelete } },
        }));
        // Step 6: Delete watchlist entries associated with deleted markets for SPOT type only
        transaction.push(prisma_1.default.exchange_watchlist.deleteMany({
            where: { symbol: { in: marketsToDelete }, type: 'TRADE' }, // Assuming SPOT type is represented as 'TRADE' in your schema
        }));
        // Step 7: Execute transaction
        await prisma_1.default.$transaction(transaction);
        // Step 8: Save unique currencies with valid precision, deposit and withdraw statuses
        const validCurrencies = await saveValidCurrencies(currencies);
        // Step 9: Save markets only if the currency exists in the validCurrencies list
        await saveValidMarkets(validCurrencies, symbols);
        // Step 10: Process currency prices (assuming you already have this function)
        await (0, controller_1.processCurrenciesPrices)();
        return {
            message: 'Exchange markets and currencies saved successfully!',
        };
    }
    catch (error) {
        console.error('Error in saveExchangeMarkets:', error);
        throw new Error('Failed to save exchange markets and currencies.');
    }
}
exports.saveExchangeMarkets = saveExchangeMarkets;
async function getExchangeDetails() {
    // Fetch the exchange details
    const exchange = await prisma_1.default.exchange.findFirst({
        where: { status: true },
    });
    if (!exchange) {
        throw new Error('No exchange found');
    }
    // Fetch the exchange markets
    const markets = await prisma_1.default.exchange_market.findMany();
    if (markets.length === 0) {
        return {
            exchange: exchange,
        };
    }
    // Prepare the response
    const response = {
        exchange: exchange,
        symbols: markets.reduce((acc, market) => {
            acc[market.symbol] = market.metadata;
            return acc;
        }, {}),
    };
    return response;
}
exports.getExchangeDetails = getExchangeDetails;
async function saveLicense(productId, username) {
    try {
        await prisma_1.default.$transaction([
            prisma_1.default.exchange.updateMany({
                where: { status: true, productId: { not: productId } },
                data: {
                    status: false,
                },
            }),
            prisma_1.default.exchange.update({
                where: { productId: productId },
                data: {
                    licenseStatus: true,
                    status: true,
                    username: username,
                },
            }),
        ]);
    }
    catch (error) {
        console.error('Error in saveLicense:', error);
        throw new Error(`Failed to save license: ${error}`);
    }
}
exports.saveLicense = saveLicense;
