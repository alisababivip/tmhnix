"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterWalletBalance = exports.createMasterWallet = exports.getMasterWalletByChainFull = exports.getMasterWalletByChain = exports.getMasterWallet = exports.getMasterWalletById = exports.getAllMasterWallets = void 0;
const passwords_1 = require("../../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
const walletSelect = {
    uuid: true,
    currency: true,
    chain: true,
    address: true,
    status: true,
    balance: true,
};
// Fetch all master wallets
async function getAllMasterWallets() {
    return (await prisma_1.default.ecosystem_master_wallet.findMany({
        select: walletSelect,
    }));
}
exports.getAllMasterWallets = getAllMasterWallets;
// Fetch a single master wallet by ID
async function getMasterWalletById(uuid) {
    return (await prisma_1.default.ecosystem_master_wallet.findUnique({
        where: {
            uuid: uuid,
        },
        select: walletSelect,
    }));
}
exports.getMasterWalletById = getMasterWalletById;
async function getMasterWallet(uuid) {
    return (await prisma_1.default.ecosystem_master_wallet.findUnique({
        where: {
            uuid: uuid,
        },
    }));
}
exports.getMasterWallet = getMasterWallet;
async function getMasterWalletByChain(chain) {
    return (await prisma_1.default.ecosystem_master_wallet.findFirst({
        where: {
            chain: chain,
        },
        select: walletSelect,
    }));
}
exports.getMasterWalletByChain = getMasterWalletByChain;
async function getMasterWalletByChainFull(chain) {
    return (await prisma_1.default.ecosystem_master_wallet.findFirst({
        where: {
            chain: chain,
        },
    }));
}
exports.getMasterWalletByChainFull = getMasterWalletByChainFull;
// Create a new master wallet
async function createMasterWallet(walletData, currency) {
    const wallet = (await prisma_1.default.ecosystem_master_wallet.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            currency: currency,
            chain: walletData.chain,
            address: walletData.address,
            data: walletData.data,
            status: 'ACTIVE',
        },
    }));
    wallet.data = ['hidden'];
    return wallet;
}
exports.createMasterWallet = createMasterWallet;
async function updateMasterWalletBalance(uuid, balance) {
    return (await prisma_1.default.ecosystem_master_wallet.update({
        where: {
            uuid: uuid,
        },
        data: {
            balance: balance,
        },
    }));
}
exports.updateMasterWalletBalance = updateMasterWalletBalance;
