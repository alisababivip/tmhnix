"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingTransactionsQuery = exports.createTransaction = exports.transactionExistsQuery = exports.updateWalletBalance = exports.updateTransaction = exports.deleteTransaction = exports.getTransactionQuery = exports.getCurrency = exports.createWalletQuery = exports.walletExistsQuery = exports.getWalletQuery = void 0;
const passwords_1 = require("../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../utils/prisma"));
async function getWalletQuery(userId, currency) {
    return await prisma_1.default.wallet.findFirst({
        where: {
            user_id: userId,
            currency: currency,
            type: 'SPOT',
        },
        include: {
            transactions: {
                orderBy: {
                    created_at: 'desc',
                },
            },
        },
    });
}
exports.getWalletQuery = getWalletQuery;
async function walletExistsQuery(userId, currency) {
    return await prisma_1.default.wallet.findFirst({
        where: {
            user_id: userId,
            currency: currency,
            type: 'SPOT',
        },
    });
}
exports.walletExistsQuery = walletExistsQuery;
async function createWalletQuery(userId, currency, addresses) {
    const wallet = await prisma_1.default.wallet.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: userId,
            type: 'SPOT',
            currency: currency,
            addresses: addresses,
        },
    });
    // Fetch the wallet with transactions included
    const walletWithTransactions = await prisma_1.default.wallet.findUnique({
        where: {
            id: wallet.id,
            type: 'SPOT',
        },
        include: {
            transactions: {
                orderBy: {
                    created_at: 'desc',
                },
            },
        },
    });
    return walletWithTransactions;
}
exports.createWalletQuery = createWalletQuery;
async function getCurrency(symbol) {
    const currency = await prisma_1.default.exchange_currency.findFirst({
        where: {
            currency: symbol,
        },
    });
    if (!currency) {
        throw new Error('Currency details not found');
    }
    return currency;
}
exports.getCurrency = getCurrency;
async function getTransactionQuery(userId, trx) {
    const transaction = await prisma_1.default.transaction.findFirst({
        where: {
            reference_id: trx,
            user_id: userId,
        },
        include: {
            wallet: {
                select: {
                    uuid: true,
                    currency: true,
                },
            },
            user: {
                select: {
                    uuid: true,
                },
            },
        },
    });
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    return transaction;
}
exports.getTransactionQuery = getTransactionQuery;
async function deleteTransaction(id) {
    await prisma_1.default.transaction.delete({
        where: {
            id: id,
        },
    });
}
exports.deleteTransaction = deleteTransaction;
async function updateTransaction(id, status, data) {
    await prisma_1.default.transaction.update({
        where: {
            id: id,
        },
        data: {
            status: status,
            ...data,
        },
    });
}
exports.updateTransaction = updateTransaction;
async function updateWalletBalance(userId, currency, amount, fee, type) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: {
            user_id: userId,
            currency: currency,
            type: 'SPOT',
        },
    });
    if (!wallet) {
        return new Error('Wallet not found');
    }
    let balance;
    switch (type) {
        case 'WITHDRAWAL':
            balance = wallet.balance - (amount + fee);
            break;
        case 'DEPOSIT':
            balance = wallet.balance + (amount - fee);
            break;
        case 'REFUND_WITHDRAWAL':
            balance = wallet.balance + amount + fee;
            break;
        default:
            break;
    }
    if (balance < 0) {
        throw new Error('Insufficient balance');
    }
    await prisma_1.default.wallet.update({
        where: {
            id: wallet.id,
        },
        data: {
            balance: balance,
        },
    });
    const updatedWallet = await prisma_1.default.wallet.findFirst({
        where: {
            id: wallet.id,
        },
    });
    return updatedWallet;
}
exports.updateWalletBalance = updateWalletBalance;
async function transactionExistsQuery(trx) {
    return await prisma_1.default.transaction.findFirst({
        where: {
            reference_id: trx,
        },
    });
}
exports.transactionExistsQuery = transactionExistsQuery;
async function createTransaction(userId, data) {
    // Extract wallet_id from data and remove it from the data object
    const { wallet_id, fee, ...transactionData } = data;
    // Validate if the fee is a number
    if (fee && isNaN(parseFloat(fee))) {
        throw new Error('Invalid fee value. Expected a number.');
    }
    const transaction = await prisma_1.default.transaction.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user: { connect: { id: userId } },
            wallet: { connect: { id: wallet_id } },
            fee: parseFloat(fee),
            ...transactionData, // Spread the remaining transaction data
        },
    });
    return transaction;
}
exports.createTransaction = createTransaction;
async function getPendingTransactionsQuery(type) {
    const transactions = await prisma_1.default.transaction.findMany({
        where: {
            status: 'PENDING',
            type: type,
            NOT: [
                {
                    reference_id: null,
                },
                {
                    reference_id: '',
                },
            ],
        },
        include: {
            wallet: {
                select: {
                    uuid: true,
                    currency: true,
                },
            },
        },
    });
    return transactions;
}
exports.getPendingTransactionsQuery = getPendingTransactionsQuery;
