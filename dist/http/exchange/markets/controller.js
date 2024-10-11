"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = exports.cacheExchangeMarkets = void 0;
const logger_1 = require("../../../logger");
const utils_1 = require("../../../utils");
const exchange_1 = __importDefault(require("../../../utils/exchange"));
const redis_1 = require("../../../utils/redis");
const queries_1 = require("./queries");
const logger = (0, logger_1.createLogger)('Exchange Markets');
async function cacheExchangeMarkets() {
    const markets = await (0, queries_1.getMarkets)();
    await redis_1.redis.set('exchangeMarkets', JSON.stringify(markets), 'EX', 10800); // Cache for 3 hours
}
exports.cacheExchangeMarkets = cacheExchangeMarkets;
cacheExchangeMarkets();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedMarkets = await redis_1.redis.get('exchangeMarkets');
            if (cachedMarkets)
                return JSON.parse(cachedMarkets);
        }
        catch (err) {
            logger.error('Redis error:', err);
        }
        return await (0, queries_1.getMarkets)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedMarkets = await redis_1.redis.get('exchangeMarkets');
            if (cachedMarkets) {
                const markets = JSON.parse(cachedMarkets);
                const market = markets.find((m) => m.id === Number(params.id));
                if (market)
                    return market;
            }
        }
        catch (err) {
            logger.error('Redis error:', err);
        }
        return await (0, queries_1.getMarket)(Number(params.id));
    }),
    ticker: (0, utils_1.handleController)(async (_, __, params) => {
        const { currency, pair } = params;
        try {
            const exchange = await exchange_1.default.startExchange();
            return await exchange.fetchTicker(`${currency}/${pair}`);
        }
        catch (error) {
            logger.error(`Failed to fetch ticker: ${error.message}`);
            throw new Error(`Failed to fetch ticker`);
        }
    }),
    orderbook: (0, utils_1.handleController)(async (_, __, params, query) => {
        const { currency, pair } = params;
        const limit = parseInt(query.limit, 10);
        try {
            const exchange = await exchange_1.default.startExchange();
            const response = await exchange.fetchOrderBook(`${currency}/${pair}`, Number(limit));
            return {
                asks: response.asks,
                bids: response.bids,
            };
        }
        catch (error) {
            logger.error(`Failed to fetch orderbook: ${error.message}`);
            throw new Error(`Failed to fetch orderbook`);
        }
    }),
    tickers: (0, utils_1.handleController)(async () => {
        let marketsCache = [];
        try {
            const cachedMarkets = await redis_1.redis.get('exchangeMarkets');
            if (cachedMarkets) {
                marketsCache = JSON.parse(cachedMarkets);
            }
            else {
                await cacheExchangeMarkets();
                marketsCache = await (0, queries_1.getMarkets)();
            }
        }
        catch (err) {
            logger.error('Redis error:', err);
        }
        try {
            const exchange = await exchange_1.default.startExchange();
            // Prepare the list of market symbols from the cache
            const marketSymbols = marketsCache.map((market) => market.symbol);
            if (marketSymbols.length === 0) {
                return [];
            }
            const tickers = await exchange.fetchTickers(marketSymbols);
            // Filter the tickers to include only the required fields
            const filteredTickers = {};
            for (const [symbol, ticker] of Object.entries(tickers)) {
                const tickerAsDefined = ticker;
                filteredTickers[symbol] = {
                    symbol: tickerAsDefined.symbol,
                    bid: tickerAsDefined.bid,
                    ask: tickerAsDefined.ask,
                    close: tickerAsDefined.close,
                    last: tickerAsDefined.last,
                    change: tickerAsDefined.percentage,
                    baseVolume: tickerAsDefined.baseVolume,
                    quoteVolume: tickerAsDefined.quoteVolume,
                };
            }
            return filteredTickers;
        }
        catch (error) {
            logger.error(`Failed to fetch tickers: ${error.message}`);
            throw new Error('Failed to fetch tickers');
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const response = await (0, queries_1.updateMarket)(Number(params.id), body.metadata, body.is_trending, body.is_hot);
        cacheExchangeMarkets(); // Update the cache
        return response;
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const response = await (0, queries_1.updateMarketsStatus)(body.ids, body.status);
        cacheExchangeMarkets(); // Update the cache
        return response;
    }),
};
