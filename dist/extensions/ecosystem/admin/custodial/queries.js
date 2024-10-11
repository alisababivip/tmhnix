"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCustodialWallet = exports.getActiveCustodialWallets = exports.getCustodialWallet = exports.getCustodialWallets = void 0;
const passwords_1 = require("../../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
async function getCustodialWallets(chain) {
    return (await prisma_1.default.ecosystem_custodial_wallet.findMany({
        where: {
            chain: chain,
        },
    }));
}
exports.getCustodialWallets = getCustodialWallets;
async function getCustodialWallet(uuid) {
    return (await prisma_1.default.ecosystem_custodial_wallet.findUnique({
        where: {
            uuid,
        },
    }));
}
exports.getCustodialWallet = getCustodialWallet;
async function getActiveCustodialWallets(chain) {
    return (await prisma_1.default.ecosystem_custodial_wallet.findMany({
        where: {
            chain: chain,
            status: 'ACTIVE',
        },
    }));
}
exports.getActiveCustodialWallets = getActiveCustodialWallets;
async function storeCustodialWallet(walletId, chain, contractAddress) {
    return (await prisma_1.default.ecosystem_custodial_wallet.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            master_wallet_id: walletId,
            address: contractAddress,
            network: process.env[`${chain}_NETWORK`],
            chain: chain,
            status: 'ACTIVE',
        },
    }));
}
exports.storeCustodialWallet = storeCustodialWallet;
