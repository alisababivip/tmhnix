"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlternativeWallet = exports.refundUser = exports.createPendingTransaction = exports.decrementWalletBalance = exports.updatePrivateLedger = exports.handleDeposit = exports.getPendingTransactions = exports.findAlternativeWallet = exports.getWalletData = exports.createWallet = exports.getWalletByUuid = exports.getWalletOnly = exports.getWallet = exports.getWallets = void 0;
const passwords_1 = require("../../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
const walletInclude = {
    transactions: true,
};
// Fetch all user wallets by user ID
async function getWallets(userId, transactions, addresses) {
    return (await prisma_1.default.wallet.findMany({
        where: {
            user_id: userId,
            type: 'ECO',
        },
        select: {
            uuid: true,
            type: true,
            currency: true,
            balance: true,
            addresses: addresses,
            transactions: transactions
                ? {
                    select: {
                        uuid: true,
                        type: true,
                        status: true,
                        amount: true,
                        fee: true,
                        description: true,
                        metadata: true,
                        reference_id: true,
                        created_at: true,
                    },
                }
                : undefined,
        },
    }));
}
exports.getWallets = getWallets;
// Fetch a single user wallet by ID
async function getWallet(userId, currency) {
    return (await prisma_1.default.wallet.findUnique({
        where: {
            wallet_user_id_currency_type_unique: {
                user_id: userId,
                currency: currency,
                type: 'ECO',
            },
        },
        include: walletInclude,
    }));
}
exports.getWallet = getWallet;
// Fetch a single user wallet by ID
async function getWalletOnly(userId, currency) {
    return (await prisma_1.default.wallet.findUnique({
        where: {
            wallet_user_id_currency_type_unique: {
                user_id: userId,
                currency: currency,
                type: 'ECO',
            },
        },
    }));
}
exports.getWalletOnly = getWalletOnly;
// Fetch a single user wallet by UUID
async function getWalletByUuid(uuid) {
    return (await prisma_1.default.wallet.findUnique({
        where: {
            uuid,
        },
        include: walletInclude,
    }));
}
exports.getWalletByUuid = getWalletByUuid;
// Create a new user wallet
async function createWallet(userId, data) {
    return (await prisma_1.default.wallet.create({
        data: {
            ...data,
            user_id: userId,
            type: 'ECO',
        },
    }));
}
exports.createWallet = createWallet;
async function getWalletData(walletId, chain) {
    return (await prisma_1.default.wallet_data.findFirst({
        where: {
            wallet_id: walletId,
            chain,
        },
    }));
}
exports.getWalletData = getWalletData;
// Find an alternative wallet with sufficient funds
async function findAlternativeWallet(walletData, amount) {
    const alternativeWalletData = await prisma_1.default.wallet_data.findFirst({
        where: {
            currency: walletData.currency,
            chain: walletData.chain,
            balance: {
                gte: amount,
            },
        },
    });
    if (!alternativeWalletData) {
        throw new Error('No alternative wallet with sufficient balance found');
    }
    return alternativeWalletData;
}
exports.findAlternativeWallet = findAlternativeWallet;
async function getPendingTransactions() {
    const pendingTransactions = (await prisma_1.default.transaction.findMany({
        where: {
            type: 'WITHDRAW',
            status: 'PENDING',
            wallet: {
                type: 'ECO',
            },
        },
    }));
    return pendingTransactions;
}
exports.getPendingTransactions = getPendingTransactions;
const handleDeposit = async (trx) => {
    const { uuid, from, amount, chain, hash, status, gasLimit, gasPrice, gasUsed, } = trx;
    const transaction = await prisma_1.default.transaction.findUnique({
        where: {
            reference_id: hash,
        },
    });
    if (transaction) {
        throw new Error('Transaction already processed');
    }
    const wallet = await prisma_1.default.wallet.findUnique({
        where: {
            uuid,
        },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const addresses = wallet.addresses;
    const address = addresses[chain];
    if (!address) {
        throw new Error('Address not found');
    }
    address.balance += parseFloat(amount);
    await prisma_1.default.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: {
                increment: parseFloat(amount), // Convert to float
            },
            addresses,
        },
    });
    await prisma_1.default.transaction.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: wallet.user_id,
            wallet_id: wallet.id,
            type: 'DEPOSIT',
            status,
            amount: parseFloat(amount),
            description: `Deposit of ${amount} ${wallet.currency} from ${from}`,
            reference_id: hash,
            fee: parseFloat(gasUsed) * parseFloat(gasPrice),
            metadata: {
                chain,
                currency: wallet.currency,
                gasLimit,
                gasPrice,
                gasUsed,
            },
        },
    });
    return true;
};
exports.handleDeposit = handleDeposit;
async function updatePrivateLedger(wallet_id, index, currency, chain, difference) {
    const networkEnvVar = `${chain}_NETWORK`;
    const networkValue = process.env[networkEnvVar];
    return await prisma_1.default.ecosystem_private_ledger.upsert({
        where: {
            private_ledger_unique: {
                wallet_id,
                index,
                currency,
                chain,
                network: networkValue,
            },
        },
        update: {
            offchain_difference: {
                increment: difference,
            },
        },
        create: {
            wallet_id,
            index,
            currency,
            chain,
            offchain_difference: difference,
            network: networkValue,
        },
    });
}
exports.updatePrivateLedger = updatePrivateLedger;
const decrementWalletBalance = async (userWallet, chain, amount) => {
    const addresses = userWallet.addresses;
    let balance = userWallet.balance - amount;
    if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(chain)) {
        balance = Number(balance.toFixed(8));
    }
    addresses[chain].balance -= amount;
    await prisma_1.default.wallet.update({
        where: { id: userWallet.id },
        data: {
            balance,
            addresses,
        },
    });
};
exports.decrementWalletBalance = decrementWalletBalance;
// Create a pending transaction entry in the database
async function createPendingTransaction(userId, walletId, currency, chain, amount, toAddress, withdrawalFee) {
    return await prisma_1.default.transaction.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: userId,
            wallet_id: walletId,
            type: 'WITHDRAW',
            status: 'PENDING',
            amount,
            fee: withdrawalFee,
            description: `Pending withdrawal of ${amount} ${currency} to ${toAddress}`,
            metadata: {
                toAddress,
                chain,
            },
        },
    });
}
exports.createPendingTransaction = createPendingTransaction;
const refundUser = async (transaction) => {
    await prisma_1.default.transaction.update({
        where: { id: transaction.id },
        data: {
            status: 'FAILED',
            description: `Refund of ${transaction.amount}`,
        },
    });
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { id: transaction.wallet_id },
    });
    const addresses = wallet.addresses;
    addresses[transaction.metadata?.chain].balance +=
        transaction.amount + transaction.fee;
    await prisma_1.default.wallet.update({
        where: { id: transaction.wallet_id },
        data: {
            balance: {
                increment: transaction.amount + transaction.fee,
            },
            addresses,
        },
    });
};
exports.refundUser = refundUser;
const updateAlternativeWallet = async (currency, chain, amount) => {
    const alternativeWalletData = await prisma_1.default.wallet_data.findFirst({
        where: {
            currency: currency,
            chain: chain,
        },
    });
    await prisma_1.default.wallet_data.update({
        where: { id: alternativeWalletData.id },
        data: {
            balance: {
                decrement: amount,
            },
        },
    });
    await updatePrivateLedger(alternativeWalletData.wallet_id, alternativeWalletData.index, currency, chain, amount);
};
exports.updateAlternativeWallet = updateAlternativeWallet;
