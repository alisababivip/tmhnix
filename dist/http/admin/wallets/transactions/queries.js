"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminTransactions = void 0;
const types_1 = require("~~/types");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getUserUUID(userUuid) {
    const user = await prisma_1.default.user.findUnique({
        where: { uuid: userUuid },
    });
    if (!user)
        throw new Error('Invalid user UUID');
    return user.id;
}
async function getWalletID(walletUuid) {
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { uuid: walletUuid },
    });
    if (!wallet)
        throw new Error('Invalid wallet UUID');
    return wallet.id;
}
async function getAdminTransactions(userUuid, type, status, walletUuid, walletType, basic = false) {
    // Determine the user ID and wallet ID if uuids are provided
    const userId = userUuid
        ? (await getUserUUID(userUuid))
        : undefined;
    const walletId = walletUuid
        ? (await getWalletID(walletUuid))
        : undefined;
    const types = [
        types_1.TransactionType.DEPOSIT,
        types_1.TransactionType.WITHDRAW,
        types_1.TransactionType.PAYMENT,
        types_1.TransactionType.INCOMING_TRANSFER,
        types_1.TransactionType.OUTGOING_TRANSFER,
    ];
    const where = {};
    if (status) {
        where.status = status;
    }
    if (userId) {
        where.user_id = userId;
    }
    if (walletId) {
        where.wallet_id = walletId;
    }
    if (type && !basic) {
        where.type = type;
    }
    if (basic) {
        where.type = {
            in: types,
        };
    }
    if (walletType) {
        where.walletType = walletType; // Assuming the field name is "walletType" in the transactions table
    }
    // Include wallet and user details in the query
    const include = {
        wallet: { select: { currency: true, type: true } },
        user: {
            select: {
                first_name: true,
                last_name: true,
                uuid: true,
                avatar: true,
            },
        },
    };
    // Query the transactions based on the where clause and include the wallet and user details
    const transactions = await prisma_1.default.transaction.findMany({
        where,
        include,
    });
    return transactions;
}
exports.getAdminTransactions = getAdminTransactions;
