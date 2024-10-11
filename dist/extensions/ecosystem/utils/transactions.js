"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPublicTransactions = exports.fetchGeneralTransactions = exports.fetchTransactions = void 0;
const date_fns_1 = require("date-fns");
const node_fetch_1 = __importDefault(require("node-fetch"));
const _1 = require(".");
const redis_1 = require("../../../utils/redis");
const utxo_1 = require("./utxo");
const HTTP_TIMEOUT = 30000;
const CACHE_EXPIRATION = 30;
const fetchTransactions = async (chain, address) => {
    const config = _1.chainConfigs[chain];
    if (!config) {
        throw new Error(`Unsupported EVM chain: ${chain}`);
    }
    try {
        if (['BTC', 'LTC', 'DOGE'].includes(chain)) {
            return await (0, utxo_1.fetchUTXOTransactions)(chain, address);
        }
        else {
            return await fetchAndParseTransactions(address, chain, config);
        }
    }
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};
exports.fetchTransactions = fetchTransactions;
const fetchAndParseTransactions = async (address, chain, config) => {
    const cacheKey = `wallet:${address}:transactions:${chain.toLowerCase()}`;
    if (config.cache) {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
    }
    const rawTransactions = await config.fetchFunction(address, chain);
    const parsedTransactions = parseRawTransactions(rawTransactions);
    if (config.cache) {
        const cacheData = {
            transactions: parsedTransactions,
            timestamp: new Date().toISOString(),
        };
        await redis_1.redis.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(cacheData));
    }
    return parsedTransactions;
};
const getCachedData = async (cacheKey) => {
    let cachedData = await redis_1.redis.get(cacheKey);
    if (cachedData && typeof cachedData === 'string') {
        cachedData = JSON.parse(cachedData);
    }
    const now = new Date();
    const lastUpdated = new Date(cachedData?.timestamp);
    if ((0, date_fns_1.differenceInMinutes)(now, lastUpdated) < 30) {
        return cachedData?.transactions;
    }
    return null;
};
const parseRawTransactions = (rawTransactions) => {
    if (!Array.isArray(rawTransactions?.result)) {
        throw new Error(`Invalid raw transactions format`);
    }
    return rawTransactions.result.map((rawTx) => {
        return {
            timestamp: rawTx.timeStamp,
            hash: rawTx.hash,
            from: rawTx.from,
            to: rawTx.to,
            amount: rawTx.value,
            method: rawTx.functionName,
            methodId: rawTx.methodId,
            contract: rawTx.contractAddress,
            confirmations: rawTx.confirmations,
            status: rawTx.txreceipt_status,
            isError: rawTx.isError,
            gas: rawTx.gas,
            gasPrice: rawTx.gasPrice,
            gasUsed: rawTx.gasUsed,
        };
    });
};
const fetchGeneralTransactions = async (chain, address) => {
    const chainConfig = _1.chainConfigs[chain];
    if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
    }
    // Determine the network to use for this chain
    const networkEnvVar = `${chain}_NETWORK`;
    const networkName = process.env[networkEnvVar];
    if (!networkName) {
        throw new Error(`Environment variable ${networkEnvVar} is not set`);
    }
    const apiEnvVar = `${chain}_EXPLORER_API_KEY`;
    const apiKey = process.env[apiEnvVar];
    if (!apiKey) {
        throw new Error(`Environment variable ${apiEnvVar} is not set`);
    }
    const network = chainConfig.networks[networkName];
    if (!network || !network.explorer) {
        throw new Error(`Unsupported or misconfigured network: ${networkName} for chain: ${chain}`);
    }
    const url = `https://${network.explorer}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    try {
        const response = await (0, node_fetch_1.default)(url, { timeout: HTTP_TIMEOUT });
        return await response.json();
    }
    catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
};
exports.fetchGeneralTransactions = fetchGeneralTransactions;
const fetchPublicTransactions = async (url) => {
    try {
        const response = await (0, node_fetch_1.default)(url, { timeout: HTTP_TIMEOUT });
        return await response.json();
    }
    catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
};
exports.fetchPublicTransactions = fetchPublicTransactions;
