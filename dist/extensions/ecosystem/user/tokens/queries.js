"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveTokensByCurrency = exports.getTokenFull = exports.getTokenByCurrency = exports.getToken = exports.getTokens = void 0;
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
const currencySelect = {
    name: true,
    currency: true,
    chain: true,
    type: true,
    status: true,
    precision: true,
    limits: true,
    decimals: true,
    icon: true,
    contractType: true,
    network: true,
    fees: true,
};
// Fetch all tokens
async function getTokens() {
    const tokens = await prisma_1.default.ecosystem_token.findMany({
        where: {
            status: true,
        },
        select: currencySelect,
    });
    return tokens.filter((token) => token.network === process.env[`${token.chain}_NETWORK`]);
}
exports.getTokens = getTokens;
// Fetch a single token by ID
async function getToken(chain, currency) {
    return (await prisma_1.default.ecosystem_token.findFirst({
        where: {
            chain,
            currency,
            network: process.env[`${chain}_NETWORK`],
        },
        select: currencySelect,
    }));
}
exports.getToken = getToken;
// Fetch a single token by ID
async function getTokenByCurrency(currency) {
    return (await prisma_1.default.ecosystem_token.findFirst({
        where: {
            currency,
        },
    }));
}
exports.getTokenByCurrency = getTokenByCurrency;
// Fetch a single token by ID
async function getTokenFull(chain, currency) {
    return (await prisma_1.default.ecosystem_token.findFirst({
        where: {
            chain,
            currency,
            network: process.env[`${chain}_NETWORK`],
        },
    }));
}
exports.getTokenFull = getTokenFull;
async function getActiveTokensByCurrency(currency) {
    const tokens = await prisma_1.default.ecosystem_token.findMany({
        where: { currency, status: true },
    });
    return tokens.filter((token) => token.network === process.env[`${token.chain}_NETWORK`]);
}
exports.getActiveTokensByCurrency = getActiveTokensByCurrency;
