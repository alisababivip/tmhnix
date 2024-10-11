"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferFunds = exports.getTransactions = exports.createWallet = exports.getWalletById = exports.fetchWalletsByType = exports.fetchWallet = exports.getWallet = exports.getWallets = void 0;
const emails_1 = require("../../utils/emails");
const passwords_1 = require("../../utils/passwords");
const prisma_1 = __importDefault(require("../../utils/prisma"));
async function getWallets(userId, transactions) {
    return (await prisma_1.default.wallet.findMany({
        where: { user_id: userId },
        include: { transactions: transactions },
    }));
}
exports.getWallets = getWallets;
async function getWallet(uuid) {
    return (await prisma_1.default.wallet.findUnique({
        where: { uuid: uuid },
    }));
}
exports.getWallet = getWallet;
async function fetchWallet(userId, currency, type) {
    return (await prisma_1.default.wallet.findFirst({
        where: { user_id: userId, currency: currency, type: type },
    }));
}
exports.fetchWallet = fetchWallet;
async function fetchWalletsByType(userId, type, transactions) {
    return (await prisma_1.default.wallet.findMany({
        where: { user_id: userId, type: type },
        include: { transactions: transactions },
    }));
}
exports.fetchWalletsByType = fetchWalletsByType;
async function getWalletById(id) {
    return (await prisma_1.default.wallet.findUnique({
        where: { id },
    }));
}
exports.getWalletById = getWalletById;
async function createWallet(userId, currency, type) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: { user_id: userId, currency: currency, type: type },
    });
    if (wallet)
        throw new Error('Wallet already exists');
    return (await prisma_1.default.wallet.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user: {
                connect: {
                    id: userId,
                },
            },
            currency: currency,
            balance: 0,
            type: type,
        },
    }));
}
exports.createWallet = createWallet;
async function getTransactions(uuid) {
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { uuid: uuid },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    return (await prisma_1.default.transaction.findMany({
        where: { wallet_id: wallet.id },
    }));
}
exports.getTransactions = getTransactions;
async function transferFunds(userId, currency, type, amount, to) {
    const response = await prisma_1.default.$transaction(async (prisma) => {
        const user = (await prisma.user.findFirst({
            where: { id: userId },
        }));
        if (!user) {
            throw new Error('User not found');
        }
        const toUser = (await prisma.user.findFirst({
            where: { uuid: to },
        }));
        if (!toUser) {
            throw new Error('Recipient user not found');
        }
        const wallet = (await prisma.wallet.findFirst({
            where: { user_id: userId, currency: currency, type: type },
        }));
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        if (wallet.balance < amount) {
            throw new Error('Insufficient funds');
        }
        const toWallet = (await prisma.wallet.upsert({
            where: {
                wallet_user_id_currency_type_unique: {
                    user_id: toUser.id,
                    currency: currency,
                    type: type,
                },
            },
            update: {},
            create: {
                uuid: (0, passwords_1.makeUuid)(),
                user: {
                    connect: {
                        id: toUser.id,
                    },
                },
                currency: currency,
                balance: 0,
                type: type,
                addresses: wallet.addresses,
            },
        }));
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: wallet.balance - amount },
        });
        await prisma.wallet.update({
            where: { id: toWallet.id },
            data: { balance: toWallet.balance + amount },
        });
        const fromTransfer = (await prisma.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                type: 'OUTGOING_TRANSFER',
                amount: amount,
                fee: 0,
                status: 'COMPLETED',
                description: `${amount} ${currency} transfer to ${toUser.first_name} ${toUser.last_name} ${toWallet.currency} wallet`,
            },
        }));
        const toTransfer = (await prisma.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: toUser.id,
                wallet_id: toWallet.id,
                type: 'INCOMING_TRANSFER',
                amount: amount,
                fee: 0,
                status: 'COMPLETED',
                description: `${amount} ${currency} transfer from ${user.first_name} ${user.last_name} ${wallet.currency} wallet`,
            },
        }));
        return {
            user: user,
            toUser: toUser,
            wallet: wallet,
            toWallet: toWallet,
            fromTransfer: fromTransfer,
            toTransfer: toTransfer,
        };
    });
    if (!response) {
        throw new Error('Error transferring funds');
    }
    try {
        await (0, emails_1.sendOutgoingTransferEmail)(response.user, response.toUser, response.wallet, amount, response.fromTransfer.uuid);
        await (0, emails_1.sendIncomingTransferEmail)(response.toUser, response.user, response.toWallet, amount, response.toTransfer.uuid);
    }
    catch (error) {
        console.log('Error sending transfer email: ', error);
    }
    return response.fromTransfer;
}
exports.transferFunds = transferFunds;
