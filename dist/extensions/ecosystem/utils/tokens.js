"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenHolders = exports.getTokenContractAddress = void 0;
const ethers_1 = require("ethers");
const node_fetch_1 = __importDefault(require("node-fetch"));
const _1 = require(".");
const logger_1 = require("../../../logger");
const redis_1 = require("../../../utils/redis");
const queries_1 = require("../user/tokens/queries");
const logger = (0, logger_1.createLogger)('Ecosystem Tokens');
const CACHE_EXPIRATION = 300; // Cache for 5 minutes
async function getTokenContractAddress(chain, currency) {
    try {
        const token = await (0, queries_1.getTokenFull)(chain, currency);
        if (!token) {
            throw new Error('Token not found');
        }
        const contractAddress = token.contract;
        if (!ethers_1.ethers.isAddress(contractAddress)) {
            throw new Error(`Invalid token contract address: ${contractAddress}`);
        }
        return {
            contractAddress,
            contractType: token.contractType,
            tokenDecimals: token.decimals,
        };
    }
    catch (error) {
        logger.error('Failed to get token contract: ' + error.message);
        throw new Error('Withdrawal failed - please try again later');
    }
}
exports.getTokenContractAddress = getTokenContractAddress;
const fetchTokenHolders = async (chain, network, contract) => {
    try {
        const chainConfig = _1.chainConfigs[chain];
        if (!chainConfig) {
            throw new Error(`Unsupported chain: ${chain}`);
        }
        const apiKey = process.env[`${chain}_EXPLORER_API_KEY`];
        if (!apiKey) {
            throw new Error(`API Key for ${chain} is not set`);
        }
        const networkConfig = chainConfig.networks[network];
        if (!networkConfig || !networkConfig.explorer) {
            throw new Error(`Unsupported network: ${network} for chain: ${chain}`);
        }
        const cacheKey = `token:${contract}:holders}`;
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            let parsedData;
            if (typeof cachedData === 'string') {
                parsedData = JSON.parse(cachedData);
            }
            else if (typeof cachedData === 'object') {
                parsedData = cachedData;
            }
            else {
                throw new Error('Invalid cache data type');
            }
            return parsedData;
        }
        const apiUrl = `https://${networkConfig.explorer}/api?module=account&action=tokentx&contractaddress=${contract}&page=1&offset=100&sort=asc&apikey=${apiKey}`;
        let data;
        try {
            const response = await (0, node_fetch_1.default)(apiUrl);
            data = await response.json();
        }
        catch (error) {
            throw new Error(`API call failed: ${error.message}`);
        }
        if (data.status !== '1') {
            throw new Error(`API Error: ${data.message}`);
        }
        const holders = {};
        for (const tx of data.result) {
            const { from, to, value } = tx;
            holders[from] = (holders[from] || 0) - parseFloat(value);
            holders[to] = (holders[to] || 0) + parseFloat(value);
        }
        const decimals = chainConfig.decimals || 18;
        const formattedHolders = Object.entries(holders)
            .map(([address, balance]) => {
            return {
                address,
                balance: parseFloat((balance / Math.pow(10, decimals)).toFixed(8)),
            };
        })
            .filter((holder) => holder.balance > 0);
        await redis_1.redis.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(formattedHolders));
        return formattedHolders;
    }
    catch (error) {
        logger.error('Failed to fetch token holders: ' + error.message);
        throw new Error('Failed to fetch token holders');
    }
};
exports.fetchTokenHolders = fetchTokenHolders;
const getCachedData = async (cacheKey) => {
    const cachedData = await redis_1.redis.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    return null;
};
