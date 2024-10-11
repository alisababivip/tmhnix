"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
// http/exchange/settings/controller.ts
const utils_1 = require("../../../utils");
const api_1 = require("../../../utils/api");
const exchange_1 = __importDefault(require("../../../utils/exchange"));
const controller_1 = require("../currencies/controller");
const controller_2 = require("../markets/controller");
const queries_1 = require("./queries");
exports.controllers = {
    checkConnection: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const exchange = await exchange_1.default.startExchangeProvider(query.exchange);
        try {
            const response = await exchange.checkRequiredCredentials();
            return {
                ...response,
                message: 'Connection successful',
            };
        }
        catch (error) {
            throw new Error(`Failed to connect to exchange: ${error}`);
        }
    }),
    fetchMarkets: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const exchangeId = query.exchange;
        if (!exchangeId) {
            throw new Error('No exchange found');
        }
        const exchange = await exchange_1.default.startExchangeProvider(exchangeId);
        await exchange.loadMarkets();
        const markets = exchange.markets;
        const groupedByQuote = {};
        for (const market of Object.values(markets)) {
            if (market.active && market.precision.price && market.precision.amount) {
                if (exchangeId === 'binance' && market.type !== 'spot') {
                    continue;
                }
                const { quote, symbol, base, precision, limits, taker, maker } = market;
                if (!groupedByQuote[quote]) {
                    groupedByQuote[quote] = {};
                }
                let precisions = {};
                switch (exchangeId) {
                    case 'binance':
                        precisions = {
                            price: precision.price,
                            amount: precision.amount,
                        };
                        break;
                    case 'kucoin':
                        precisions = {
                            price: countDecimals(precision.price),
                            amount: countDecimals(precision.amount),
                        };
                        break;
                }
                groupedByQuote[quote][symbol] = {
                    symbol,
                    base,
                    quote,
                    precision: precisions,
                    limits,
                    taker,
                    maker,
                };
            }
        }
        return groupedByQuote;
    }),
    saveMarkets: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.saveExchangeMarkets)(body.symbols, body.currencies);
            await (0, controller_2.cacheExchangeMarkets)();
            await (0, controller_1.cacheExchangeCurrencies)();
            return {
                message: 'Exchange markets and currencies saved successfully!',
            };
        }
        catch (error) {
            throw new Error(`Failed to save exchange markets: ${error.message}`);
        }
    }),
    getDetails: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getExchangeDetails)();
    }),
    verify: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const response = await (0, api_1.verifyLicense)(body.productId, body.purchaseCode, body.envatoUsername);
        // Check if the response has a message and if it starts with "Verified"
        if (response.message && response.message.startsWith('Verified')) {
            try {
                await (0, queries_1.saveLicense)(body.productId, body.envatoUsername);
            }
            catch (error) {
                console.log('Error saving license:', error.message);
            }
        }
        else {
            console.log('License verification failed or not verified.');
        }
    }),
    activate: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        if (!body.envatoUsername || !body.productId || !body.purchaseCode) {
            throw new Error('Missing required fields');
        }
        try {
            const response = await (0, api_1.activateLicense)(body.productId, body.purchaseCode, body.envatoUsername);
            if (response.lic_response) {
                try {
                    await (0, queries_1.saveLicense)(body.productId, body.envatoUsername);
                }
                catch (error) {
                    console.log('Error saving license:', error.message);
                }
            }
            return {
                message: response.message,
            };
        }
        catch (error) {
            throw new Error(`Failed to activate license: ${error.message}`);
        }
    }),
    fetchCurrencies: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const exchangeId = query.exchange;
        if (!exchangeId) {
            throw new Error('No exchange found');
        }
        const exchange = await exchange_1.default.startExchangeProvider(exchangeId);
        await exchange.loadMarkets();
        const currencies = exchange.currencies;
        // Transforming the currencies to include only required fields
        const transformedCurrencies = {};
        Object.values(currencies).forEach((currency) => {
            let standardizedNetworks;
            if (exchangeId === 'binance') {
                standardizedNetworks = standardizeBinanceData(currency.networks);
            }
            else if (exchangeId === 'kucoin') {
                standardizedNetworks = standardizeKucoinData(currency);
            }
            transformedCurrencies[currency['code']] = {
                currency: currency['code'],
                name: currency['name'],
                precision: currency['precision'],
                status: currency['active'],
                deposit: currency['deposit'],
                withdraw: currency['withdraw'],
                fee: currency['fee'],
                chains: standardizedNetworks,
            };
        });
        return transformedCurrencies;
    }),
};
// Function to standardize data from Binance
const standardizeBinanceData = (data) => {
    return data.map((item) => ({
        network: item.network,
        withdrawStatus: item.withdrawEnable,
        depositStatus: item.depositEnable,
        minWithdraw: parseFloat(item.withdrawMin),
        maxWithdraw: parseFloat(item.withdrawMax),
        withdrawFee: parseFloat(item.withdrawFee),
        withdrawMemo: item.memoRegex && item.memoRegex.trim() !== '' ? true : false,
    }));
};
// Function to standardize data from Kucoin
const standardizeKucoinData = (data) => {
    const standardizedData = data.info?.chains || []; // Fetching chains from info
    return standardizedData.map((chain) => ({
        network: chain.chainName,
        withdrawStatus: chain.isWithdrawEnabled,
        depositStatus: chain.isDepositEnabled,
        minWithdraw: parseFloat(chain.withdrawalMinSize),
        maxWithdraw: null,
        withdrawFee: parseFloat(chain.withdrawalMinFee),
        withdrawMemo: chain.contractAddress && chain.contractAddress.trim() !== ''
            ? true
            : false,
        chainId: chain.chainId.toUpperCase(),
    }));
};
function countDecimals(num) {
    if (Math.floor(num) === num)
        return 0;
    const str = num.toString();
    const scientificNotationMatch = /^(\d+\.?\d*|\.\d+)e([\+\-]\d+)$/.exec(str);
    if (scientificNotationMatch) {
        const decimalStr = scientificNotationMatch[1].split('.')[1] || '';
        let decimalCount = decimalStr.length + parseInt(scientificNotationMatch[2]);
        decimalCount = Math.abs(decimalCount); // Take the absolute value
        return Math.min(decimalCount, 8);
    }
    else {
        const decimalStr = str.split('.')[1] || '';
        return Math.min(decimalStr.length, 8);
    }
}
