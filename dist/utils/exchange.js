"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ccxt = __importStar(require("ccxt"));
const logger_1 = require("../logger");
const prisma_1 = __importDefault(require("./prisma"));
const system_1 = require("./system");
const logger = (0, logger_1.createLogger)('Exchange');
class ExchangeManager {
    static instance = new ExchangeManager();
    exchangeCache = new Map();
    provider = null;
    exchange = null;
    exchangeProvider = null;
    async fetchActiveProvider() {
        try {
            const provider = await prisma_1.default.exchange.findFirst({
                where: {
                    status: true,
                },
            });
            if (!provider) {
                logger.error('No active provider found.');
                return null;
            }
            return provider.name;
        }
        catch (error) {
            logger.error('Error fetching active provider:', error);
            return null;
        }
    }
    async initializeExchange(provider, retries = 3) {
        if (this.exchangeCache.has(provider)) {
            return this.exchangeCache.get(provider);
        }
        const apiKey = process.env[`APP_${provider.toUpperCase()}_API_KEY`];
        const apiSecret = process.env[`APP_${provider.toUpperCase()}_API_SECRET`];
        const apiPassphrase = process.env[`APP_${provider.toUpperCase()}_API_PASSPHRASE`];
        if (!apiKey || !apiSecret || apiKey === '' || apiSecret === '') {
            logger.error(`API credentials for ${provider} are missing.`);
        }
        try {
            let exchange = new ccxt.pro[provider]({
                apiKey,
                secret: apiSecret,
                password: apiPassphrase,
            });
            const credentialsValid = await exchange.checkRequiredCredentials();
            if (!credentialsValid) {
                logger.error(`API credentials for ${provider} are invalid.`);
                await exchange.close();
                exchange = new ccxt[provider]();
            }
            try {
                await exchange.loadMarkets();
            }
            catch (error) {
                logger.error(`Failed to load markets: ${error.message}`);
                await exchange.close();
                exchange = new ccxt[provider]();
            }
            this.exchangeCache.set(provider, exchange);
            return exchange;
        }
        catch (error) {
            logger.error(`Failed to initialize exchange: ${error}`);
            if (retries > 0) {
                logger.error(`Retrying (${retries} retries left)...`);
                await (0, system_1.sleep)(2000);
                return this.initializeExchange(provider, retries - 1);
            }
            return null;
        }
    }
    async startExchange() {
        if (this.exchange) {
            return this.exchange;
        }
        this.provider = this.provider || (await this.fetchActiveProvider());
        if (!this.provider) {
            return null;
        }
        this.exchange =
            this.exchangeCache.get(this.provider) ||
                (await this.initializeExchange(this.provider));
        return this.exchange;
    }
    async startExchangeProvider(provider) {
        if (!provider) {
            throw new Error('Provider is required to start exchange provider.');
        }
        this.exchangeProvider =
            this.exchangeCache.get(provider) ||
                (await this.initializeExchange(provider));
        return this.exchangeProvider;
    }
    removeExchange(provider) {
        if (!provider) {
            throw new Error('Provider is required to remove exchange.');
        }
        this.exchangeCache.delete(provider);
        if (this.provider === provider) {
            this.exchange = null;
            this.provider = null;
        }
    }
}
exports.default = ExchangeManager.instance;
