"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserWalletBalance = exports.updateTransactionStatusQuery = exports.updateWalletBalance = exports.getWallet = exports.getWallets = void 0;
const emails_1 = require("~~/utils/emails");
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getUserID(userUuid) {
    const user = await prisma_1.default.user.findUnique({
        where: { uuid: userUuid },
    });
    if (!user)
        throw new Error('Invalid user UUID');
    return user.id;
}
async function getWallets(filter = '', perPage = 10, page = 1, userUuid, type, hideSmallBalances) {
    // Determine the user ID if userUuid is provided
    const userId = userUuid ? await getUserID(userUuid) : undefined;
    // Define the where clause based on the provided parameters
    const where = {};
    if (userId) {
        where.user_id = userId;
    }
    if (type) {
        where.type = type;
    }
    if (filter) {
        // Extend the OR condition to include a check for non-null addresses
        where.OR = [
            { currency: { contains: filter } },
            { uuid: { contains: filter } },
        ];
    }
    if (hideSmallBalances) {
        where.balance = { gt: 0 };
    }
    // Calculate the pagination variables
    const skip = (page - 1) * perPage;
    const take = perPage;
    // Include user details in the query
    const include = {
        user: {
            select: {
                first_name: true,
                last_name: true,
                uuid: true,
                avatar: true,
            },
        },
    };
    // Execute the paginated query and count query in parallel
    const [wallets, totalCount] = await prisma_1.default.$transaction([
        prisma_1.default.wallet.findMany({
            where,
            include,
            take,
            skip,
        }),
        prisma_1.default.wallet.count({ where }),
    ]);
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / perPage);
    // Format the response to include pagination metadata
    const paginatedResponse = {
        data: wallets,
        pagination: {
            totalItems: totalCount,
            currentPage: page,
            pageSize: perPage,
            totalPages: totalPages,
        },
    };
    return paginatedResponse;
}
exports.getWallets = getWallets;
async function getWallet(uuid) {
    return (await prisma_1.default.wallet.findUnique({
        where: { uuid: uuid },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            transactions: {
                select: {
                    id: true,
                    uuid: true,
                    amount: true,
                    fee: true,
                    type: true,
                    status: true,
                    created_at: true,
                    metadata: true,
                },
            },
        },
    }));
}
exports.getWallet = getWallet;
async function updateWalletBalance(uuid, type, amount) {
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { uuid },
    });
    if (!wallet)
        throw new Error('Wallet not found');
    // Fetch the user information to pass to the email function
    const user = await prisma_1.default.user.findUnique({
        where: { id: wallet.user_id },
    });
    if (!user)
        throw new Error('User not found');
    const newBalance = type === 'ADD' ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0)
        throw new Error('Insufficient funds in wallet');
    const updatedWallet = await prisma_1.default.wallet.update({
        where: { uuid },
        data: { balance: newBalance },
    });
    await prisma_1.default.transaction.create({
        data: {
            uuid: (0, passwords_1.makeUuid)(),
            user_id: wallet.user_id,
            wallet_id: wallet.id,
            amount: amount,
            type: type === 'ADD' ? 'INCOMING_TRANSFER' : 'OUTGOING_TRANSFER',
            status: 'COMPLETED',
            metadata: {
                method: 'ADMIN',
            },
            description: `Admin ${type === 'ADD' ? 'added' : 'subtracted'} ${amount} ${wallet.currency} to wallet`,
        },
    });
    await (0, emails_1.sendWalletBalanceUpdateEmail)(user, updatedWallet, type === 'ADD' ? 'added' : 'subtracted', amount, newBalance);
    const returnWallet = await prisma_1.default.wallet.findUnique({
        where: { uuid },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            transactions: {
                select: {
                    id: true,
                    uuid: true,
                    amount: true,
                    fee: true,
                    type: true,
                    status: true,
                    created_at: true,
                    metadata: true,
                },
            },
        },
    });
    return returnWallet;
}
exports.updateWalletBalance = updateWalletBalance;
async function updateTransactionStatusQuery(referenceId, status, message) {
    const transaction = await prisma_1.default.transaction.findUnique({
        where: { uuid: referenceId },
    });
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    const updateData = {
        status: status,
        metadata: transaction.metadata,
    };
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { id: transaction.wallet_id },
    });
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    let balance = Number(wallet.balance);
    if (status === 'REJECTED') {
        if (message) {
            updateData.metadata.note = message;
        }
        if (transaction.type === 'WITHDRAW') {
            balance += Number(transaction.amount);
        }
    }
    else if (status === 'COMPLETED') {
        if (transaction.type === 'DEPOSIT') {
            balance += Number(transaction.amount) - Number(transaction.fee);
        }
    }
    if (wallet.balance !== balance) {
        await prisma_1.default.wallet.update({
            where: { id: wallet.id },
            data: { balance: balance },
        });
    }
    const updatedTransaction = (await prisma_1.default.transaction.update({
        where: { uuid: referenceId },
        data: updateData,
    }));
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: transaction.user_id },
        });
        await (0, emails_1.sendTransactionStatusUpdateEmail)(user, updatedTransaction, wallet, balance, updateData.metadata?.note || null);
    }
    catch (error) {
        console.error(error);
    }
    return updatedTransaction;
}
exports.updateTransactionStatusQuery = updateTransactionStatusQuery;
async function updateUserWalletBalance(id, amount, fee, type) {
    const wallet = await prisma_1.default.wallet.findFirst({
        where: {
            id,
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
exports.updateUserWalletBalance = updateUserWalletBalance;
