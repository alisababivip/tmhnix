"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToOrderArray = exports.removeFromRedis = exports.loadFromRedis = exports.loadKeysFromRedis = exports.offloadToRedis = exports.normalizeTimeToInterval = exports.intervalToMs = exports.extractParamsFromIdentifier = exports.generateIdentifier = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const util_1 = require("util");
const redis_1 = require("../../../utils/redis");
const setAsync = (0, util_1.promisify)(redis_1.redis.set).bind(redis_1.redis);
const getAsync = (0, util_1.promisify)(redis_1.redis.get).bind(redis_1.redis);
const delAsync = (0, util_1.promisify)(redis_1.redis.del).bind(redis_1.redis);
const keysAsync = (0, util_1.promisify)(redis_1.redis.keys).bind(redis_1.redis);
function generateIdentifier(type, params) {
    switch (type) {
        case 'watchDeposits':
            return `${params.chain}-${params.address.toLowerCase()}`;
        case 'watchOrderBook':
            return `${params.symbol}`;
        case 'watchTickers':
            return `tickers`;
        case 'watchTicker':
            return params.symbol;
        case 'watchCandles':
            return `${params.symbol}-${params.interval}`;
        case 'watchOrders':
            return `${params.id}`;
        default:
            return '';
    }
}
exports.generateIdentifier = generateIdentifier;
function extractParamsFromIdentifier(type, identifier) {
    let params = {};
    switch (type) {
        case 'watchDeposits':
            const [chain, address] = identifier.split('-');
            params = { chain, address };
            break;
        case 'watchOrderBook':
            params = { symbol: identifier };
            break;
        case 'watchTickers':
            break;
        case 'watchTicker':
            params = { symbol: identifier };
            break;
        case 'watchCandles':
            const [symbol, interval] = identifier.split('-');
            params = { symbol, interval };
            break;
        case 'watchOrders':
            params = { id: identifier };
            break;
        default:
            break;
    }
    return params;
}
exports.extractParamsFromIdentifier = extractParamsFromIdentifier;
function intervalToMs(interval) {
    const units = {
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
    };
    const unit = interval.slice(-1);
    const value = parseInt(interval.slice(0, -1), 10);
    return units[unit] * value;
}
exports.intervalToMs = intervalToMs;
function normalizeTimeToInterval(timestamp, interval) {
    const date = (0, dayjs_1.default)(timestamp);
    switch (interval.slice(-1)) {
        case 'm':
            return date.startOf('minute').valueOf();
        case 'h':
            return date.startOf('hour').valueOf();
        case 'd':
            return date.startOf('day').valueOf();
        case 'w':
            return date.startOf('week').valueOf();
        default:
            throw new Error(`Invalid interval: ${interval}`);
    }
}
exports.normalizeTimeToInterval = normalizeTimeToInterval;
async function offloadToRedis(key, value) {
    const serializedValue = JSON.stringify(value);
    await setAsync(key, serializedValue);
}
exports.offloadToRedis = offloadToRedis;
async function loadKeysFromRedis(pattern) {
    try {
        const keys = await keysAsync(pattern);
        return keys;
    }
    catch (error) {
        console.error('Failed to fetch keys:', error);
        return [];
    }
}
exports.loadKeysFromRedis = loadKeysFromRedis;
async function loadFromRedis(identifier) {
    const dataStr = await getAsync(identifier);
    if (!dataStr)
        return null;
    try {
        return JSON.parse(dataStr);
    }
    catch (error) {
        console.error('Failed to parse JSON:', error);
    }
}
exports.loadFromRedis = loadFromRedis;
async function removeFromRedis(key) {
    try {
        const delResult = await delAsync(key);
        console.log(`Delete Result for key ${key}: `, delResult);
    }
    catch (error) { }
}
exports.removeFromRedis = removeFromRedis;
async function convertToOrderArray(rawData) {
    const parsedData = [];
    for (let i = 0; i < rawData.length; i += 2) {
        parsedData.push([parseFloat(rawData[i]), parseFloat(rawData[i + 1])]);
    }
    return parsedData;
}
exports.convertToOrderArray = convertToOrderArray;
