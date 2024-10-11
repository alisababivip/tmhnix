"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCurrenciesPrices = exports.controllers = exports.cacheExchangeCurrencies = void 0;
const utils_1 = require("../../../utils");
const exchange_1 = __importDefault(require("../../../utils/exchange"));
const redis_1 = require("../../../utils/redis");
const controller_1 = require("../markets/controller");
const queries_1 = require("../markets/queries");
const queries_2 = require("./queries");
// Function to cache the currencies
async function cacheExchangeCurrencies() {
    const currencies = await (0, queries_2.getCurrencies)();
    await redis_1.redis.set('exchangeCurrencies', JSON.stringify(currencies), 'EX', 1800); // Cache for 30 minutes
}
exports.cacheExchangeCurrencies = cacheExchangeCurrencies;
// Initialize the cache when the file is loaded
cacheExchangeCurrencies();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedCurrencies = await redis_1.redis.get('exchangeCurrencies');
            if (cachedCurrencies)
                return JSON.parse(cachedCurrencies);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_2.getCurrencies)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedCurrencies = await redis_1.redis.get('exchangeCurrencies');
            if (cachedCurrencies) {
                const currencies = JSON.parse(cachedCurrencies);
                const currency = currencies.find((c) => c.id === Number(params.id));
                if (currency)
                    return currency;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_2.getCurrency)(Number(params.id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const response = await (0, queries_2.updateCurrency)(Number(params.id), body.data);
        cacheExchangeCurrencies();
        return response;
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const response = await (0, queries_2.updateCurrenciesStatus)(body.ids, body.status);
        cacheExchangeCurrencies();
        return response;
    }),
    updateChains: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const response = await (0, queries_2.updateCurrencyChains)(Number(params.id), body.chains);
        cacheExchangeCurrencies();
        return response;
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await processCurrenciesPrices();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
async function processCurrenciesPrices() {
    const exchange = await exchange_1.default.startExchange();
    let markets = {};
    let marketsCache = [];
    let currenciesCache = [];
    // Fetch markets from Redis cache
    try {
        const cachedMarkets = await redis_1.redis.get('exchangeMarkets');
        if (cachedMarkets) {
            marketsCache = JSON.parse(cachedMarkets);
        }
        else {
            await (0, controller_1.cacheExchangeMarkets)();
            marketsCache = await (0, queries_1.getMarkets)();
        }
    }
    catch (err) {
        console.error('Redis error:', err);
    }
    // Fetch currencies from Redis cache
    try {
        const cachedCurrencies = await redis_1.redis.get('exchangeCurrencies');
        if (cachedCurrencies) {
            currenciesCache = JSON.parse(cachedCurrencies);
        }
        else {
            await cacheExchangeCurrencies();
            currenciesCache = await (0, queries_2.getCurrencies)();
        }
    }
    catch (err) {
        console.error('Redis error:', err);
    }
    const marketSymbols = marketsCache.map((market) => market.symbol);
    try {
        markets = await exchange.fetchTickers(marketSymbols);
    }
    catch (error) {
        console.log('Update currencies pricing failed:', error.message);
        return;
    }
    // Filter symbols with pair "USDT"
    const usdtPairs = Object.keys(markets).filter((symbol) => symbol.endsWith('/USDT'));
    if (!currenciesCache) {
        await cacheExchangeCurrencies();
    }
    // Prepare data for bulk update
    const bulkUpdateData = usdtPairs
        .map((symbol) => {
        const currency = symbol.split('/')[0];
        const matchingCurrency = currenciesCache.find((dbCurrency) => dbCurrency.currency === currency);
        if (matchingCurrency) {
            return {
                id: matchingCurrency.id,
                price: markets[symbol].last, // last price of the ticker
            };
        }
        return null;
    })
        .filter((item) => item !== null);
    // Add USDT with price 1 if it's in the database currencies
    const usdtCurrency = currenciesCache.find((dbCurrency) => dbCurrency.currency === 'USDT');
    if (usdtCurrency) {
        bulkUpdateData.push({
            id: usdtCurrency.id,
            price: 1,
        });
    }
    // Bulk update currency price in database
    try {
        await (0, queries_2.updateCurrencyPricesBulk)(bulkUpdateData);
    }
    catch (error) {
        console.log('Update currencies pricing failed:', error.message);
    }
    return true;
}
exports.processCurrenciesPrices = processCurrenciesPrices;
