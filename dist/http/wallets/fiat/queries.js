"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFiatDepositMethod = exports.withdrawFiat = exports.depositFiat = exports.updateWallet = exports.getWithdrawMethod = exports.getWithdrawMethods = exports.getDepositMethod = exports.getDepositMethods = exports.getDepositGateway = exports.getDepositGateways = void 0;
const types_1 = require("~~/types");
const emails_1 = require("~~/utils/emails");
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getDepositGateways() {
    return prisma_1.default.deposit_gateway.findMany();
}
exports.getDepositGateways = getDepositGateways;
async function getDepositGateway(id) {
    return prisma_1.default.deposit_gateway.findUnique({
        where: { id },
    });
}
exports.getDepositGateway = getDepositGateway;
async function getDepositMethods() {
    return (await prisma_1.default.deposit_method.findMany());
}
exports.getDepositMethods = getDepositMethods;
async function getDepositMethod(id) {
    return (await prisma_1.default.deposit_method.findUnique({
        where: { id },
    }));
}
exports.getDepositMethod = getDepositMethod;
async function getWithdrawMethods() {
    return (await prisma_1.default.withdraw_method.findMany());
}
exports.getWithdrawMethods = getWithdrawMethods;
async function getWithdrawMethod(id) {
    return (await prisma_1.default.withdraw_method.findUnique({
        where: { id },
    }));
}
exports.getWithdrawMethod = getWithdrawMethod;
async function updateWallet(uuid, data) {
    return (await prisma_1.default.wallet.update({
        where: { uuid: uuid },
        data: data.wallet,
    }));
}
exports.updateWallet = updateWallet;
async function depositFiat(userId, transaction, currency) {
    const user = (await prisma_1.default.user.findUnique({
        where: { id: userId },
    }));
    if (!user) {
        throw new Error('User not found');
    }
    // If it exists, return it without making any changes
    if (transaction.reference_id) {
        const existingTransaction = await prisma_1.default.transaction.findUnique({
            where: { reference_id: transaction.reference_id },
        });
        if (existingTransaction) {
            return existingTransaction;
        }
    }
    // Find the user's wallet
    const wallet = await prisma_1.default.wallet.findFirst({
        where: { user_id: user.id, currency: currency },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const walletBalance = Number(wallet.balance);
    let newBalance = 0;
    switch (transaction.type) {
        case types_1.TransactionType.DEPOSIT:
            newBalance = walletBalance + transaction.amount;
            break;
        case types_1.TransactionType.WITHDRAW:
            newBalance = walletBalance - transaction.amount;
            break;
        case types_1.TransactionType.PAYMENT:
            newBalance = walletBalance - transaction.amount;
            break;
        case types_1.TransactionType.OUTGOING_TRANSFER:
            newBalance = walletBalance - transaction.amount;
            break;
        case types_1.TransactionType.INCOMING_TRANSFER:
            newBalance = walletBalance + transaction.amount;
            break;
        default:
            break;
    }
    // Start a Prisma transaction
    const createdTransaction = await prisma_1.default.$transaction([
        // Create a new transaction
        prisma_1.default.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: user.id,
                wallet_id: wallet.id,
                ...transaction,
            },
        }),
        // Update the wallet's balance
        prisma_1.default.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
        }),
    ]);
    const newTransaction = await prisma_1.default.transaction.findUnique({
        where: { id: createdTransaction[0].id },
        include: { wallet: true },
    });
    await (0, emails_1.sendFiatTransactionEmail)(user, newTransaction, newBalance);
    return createdTransaction[0];
}
exports.depositFiat = depositFiat;
async function withdrawFiat(userId, walletUuid, methodId, amount, total, custom_data) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: { uuid: walletUuid },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const method = await prisma_1.default.withdraw_method.findUnique({
        where: { id: methodId },
    });
    if (!method) {
        throw new Error('Withdraw method not found');
    }
    const walletBalance = Number(wallet.balance);
    const newBalance = walletBalance - total;
    // Start a Prisma transaction
    await prisma_1.default.$transaction([
        // Update the wallet's balance
        prisma_1.default.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
        }),
        // Create a new transaction
        prisma_1.default.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                type: 'WITHDRAW',
                amount: total,
                fee: total - amount,
                metadata: {
                    method: method.title,
                    custom_data: custom_data,
                },
                description: `Withdraw ${amount} ${wallet.currency} by ${method.title}`,
            },
        }),
    ]);
}
exports.withdrawFiat = withdrawFiat;
async function customFiatDepositMethod(userId, walletUuid, methodId, amount, total, custom_data) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: { uuid: walletUuid },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const method = await prisma_1.default.deposit_method.findUnique({
        where: { id: methodId },
    });
    if (!method) {
        throw new Error('Deposit method not found');
    }
    // Start a Prisma transaction
    await prisma_1.default.$transaction([
        prisma_1.default.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                type: 'DEPOSIT',
                amount: total,
                fee: total - amount,
                status: 'PENDING',
                metadata: {
                    method: method.title,
                    custom_data: custom_data,
                },
                description: `Deposit ${amount} ${wallet.currency} by ${method.title}`,
            },
        }),
    ]);
}
exports.customFiatDepositMethod = customFiatDepositMethod;
