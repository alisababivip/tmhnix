"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFiatCurrencyPrices = exports.controllers = exports.cacheCurrencies = void 0;
const utils_1 = require("../../utils");
const redis_1 = require("../../utils/redis");
const queries_1 = require("./queries");
// Function to cache the currencies
async function cacheCurrencies() {
    const currencies = await (0, queries_1.getCurrencies)();
    await redis_1.redis.set('currencies', JSON.stringify(currencies), 'EX', 300); // Cache for 5 minutes
}
exports.cacheCurrencies = cacheCurrencies;
// Initialize the cache when the file is loaded
cacheCurrencies();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedCurrencies = await redis_1.redis.get('currencies');
            if (cachedCurrencies)
                return JSON.parse(cachedCurrencies);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getCurrencies)();
    }),
    show: (0, utils_1.handleController)(async (_, params) => {
        try {
            const cachedCurrencies = await redis_1.redis.get('currencies');
            if (cachedCurrencies) {
                const currencies = JSON.parse(cachedCurrencies);
                const currency = currencies.find((c) => c.id === params.id);
                if (currency)
                    return currency;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getCurrency)(params.id);
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await fetchFiatCurrencyPrices();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
async function fetchFiatCurrencyPrices() {
    const baseCurrency = 'USD';
    const apiKey = process.env.APP_OPENEXCHANGERATES_APP_ID;
    try {
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=${baseCurrency}`);
        const data = await response.json();
        if (data && data.rates) {
            const exchangeRates = data.rates;
            const ratesToUpdate = {};
            const currenciesRaw = await redis_1.redis.get('currencies');
            if (!currenciesRaw) {
                throw new Error('No currencies data available');
            }
            let currencies;
            try {
                currencies = JSON.parse(currenciesRaw);
            }
            catch (parseError) {
                throw new Error(`Error parsing currencies data: ${parseError.message}`);
            }
            if (!Array.isArray(currencies)) {
                throw new Error('Currencies data is not an array');
            }
            for (const currency of currencies) {
                if (exchangeRates.hasOwnProperty(currency.code)) {
                    ratesToUpdate[currency.code] = exchangeRates[currency.code];
                }
            }
            await (0, queries_1.updateCurrencyRates)(ratesToUpdate);
            cacheCurrencies();
        }
        else {
            console.log('Error fetching fiat currency prices:');
        }
    }
    catch (error) {
        console.error('Error in fetchFiatCurrencyPrices:', error);
        throw error;
    }
}
exports.fetchFiatCurrencyPrices = fetchFiatCurrencyPrices;
