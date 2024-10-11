"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoricalOHLCV = void 0;
const exchange_1 = __importDefault(require("~~/utils/exchange"));
async function getHistoricalOHLCV(symbol, interval, from, to, duration) {
    let since, max;
    const exchange = await exchange_1.default.startExchange();
    const provider = await exchange_1.default.provider;
    switch (provider) {
        case 'binance':
            since = to - duration / 3;
            max = 500;
            break;
        case 'kucoin':
            since = to - duration;
            max = 1500;
            break;
        case 'bitget':
            since = to - duration / 1.5;
            max = 1000;
            break;
        default:
            since = to - duration;
            max = 1000;
            break;
    }
    try {
        const data = await exchange.fetchOHLCV(symbol, interval, since, max);
        return data;
    }
    catch (e) {
        if (e.constructor.name === '419') {
            const data = await exchange.fetchOHLCV(symbol, interval, since);
            return data;
        }
        throw new Error(e);
    }
}
exports.getHistoricalOHLCV = getHistoricalOHLCV;
