"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveMarkets = exports.getTotalMarkets = exports.getActiveTokens = exports.getTotalTokens = exports.getActiveCustodialWallets = exports.getTotalCustodialWallets = exports.getActiveMasterWallets = exports.getTotalMasterWallets = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getTotalMasterWallets() {
    return await prisma.ecosystem_master_wallet.count();
}
exports.getTotalMasterWallets = getTotalMasterWallets;
async function getActiveMasterWallets() {
    return await prisma.ecosystem_master_wallet.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveMasterWallets = getActiveMasterWallets;
async function getTotalCustodialWallets() {
    return await prisma.ecosystem_custodial_wallet.count();
}
exports.getTotalCustodialWallets = getTotalCustodialWallets;
async function getActiveCustodialWallets() {
    return await prisma.ecosystem_custodial_wallet.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveCustodialWallets = getActiveCustodialWallets;
async function getTotalTokens() {
    return await prisma.ecosystem_token.count();
}
exports.getTotalTokens = getTotalTokens;
async function getActiveTokens() {
    return await prisma.ecosystem_token.count({
        where: {
            status: true,
        },
    });
}
exports.getActiveTokens = getActiveTokens;
async function getTotalMarkets() {
    return await prisma.ecosystem_market.count();
}
exports.getTotalMarkets = getTotalMarkets;
async function getActiveMarkets() {
    return await prisma.ecosystem_market.count({
        where: {
            status: true,
        },
    });
}
exports.getActiveMarkets = getActiveMarkets;
