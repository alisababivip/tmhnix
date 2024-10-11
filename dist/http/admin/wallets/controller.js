"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const queries_1 = require("~~/http/auth/queries");
const queries_2 = require("~~/http/wallets/spot/queries");
const logger_1 = require("~~/logger");
const types_1 = require("~~/types");
const utils_1 = require("~~/utils");
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const exchange_1 = __importDefault(require("../../../utils/exchange"));
const queries_3 = require("./queries");
const logger = (0, logger_1.createLogger)('Spot Wallets');
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { filter, perPage, page, user, type, hideSmallBalances } = query;
        const perPageNumber = perPage ? parseInt(perPage, 10) : 10;
        const pageNumber = page ? parseInt(page, 10) : 1;
        return (0, queries_3.getWallets)(filter, perPageNumber, pageNumber, user, type, hideSmallBalances === 'true');
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_3.getWallet)(params.uuid);
    }),
    updateBalance: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_3.updateWalletBalance)(body.uuid, body.type, body.amount);
            return {
                ...response,
                message: 'Wallet balance updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateTransactionStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_3.updateTransactionStatusQuery)(body.referenceId, body.status, body.message);
            return {
                ...response,
                message: 'Transaction status updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    approveSpotWalletWithdrawal: (0, utils_1.handleController)(async (_, __, params) => {
        const { uuid } = params;
        try {
            const transaction = await prisma_1.default.transaction.findUnique({
                where: { uuid },
            });
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new Error('Transaction is not pending');
            }
            const { amount, user_id } = transaction;
            const { currency, chain, address, memo } = transaction.metadata;
            // Fetch the user's wallet
            const wallet = (await (0, queries_2.getWalletQuery)(user_id, currency));
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const currencyData = await (0, queries_2.getCurrency)(currency);
            if (!currencyData) {
                throw new Error('Currency not found');
            }
            const fee = currencyData.chains?.find((c) => c.network === chain)?.withdrawFee || 0;
            const withdrawAmount = Number(amount) + Number(fee);
            if (withdrawAmount > wallet.balance) {
                throw new Error('Your withdraw amount including fees is higher than your balance');
            }
            // Initialize exchange
            const exchange = await exchange_1.default.startExchange();
            const provider = await exchange_1.default.provider;
            // Implement your third-party API logic here
            let withdrawResponse, withdrawStatus;
            switch (provider) {
                case 'kucoin':
                    try {
                        const transferProcess = await exchange.transfer(currency, withdrawAmount, 'main', 'trade');
                        if (transferProcess.id) {
                            try {
                                withdrawResponse = await exchange.withdraw(currency, withdrawAmount, address, memo, { network: chain });
                                if (withdrawResponse.id) {
                                    try {
                                        const withdrawals = await exchange.fetchWithdrawals(currency);
                                        const withdrawData = withdrawals.find((w) => w.id === withdrawResponse.id);
                                        if (withdrawData) {
                                            withdrawResponse.fee =
                                                withdrawAmount * fee + withdrawData.fee?.cost;
                                            switch (withdrawData.status) {
                                                case 'ok':
                                                    withdrawStatus = types_1.TransactionStatus.COMPLETED;
                                                    break;
                                                case 'canceled':
                                                    withdrawStatus = types_1.TransactionStatus.CANCELLED;
                                                    break;
                                                case 'failed':
                                                    withdrawStatus = types_1.TransactionStatus.FAILED;
                                                default:
                                                    withdrawStatus = types_1.TransactionStatus.PENDING;
                                                    break;
                                            }
                                        }
                                    }
                                    catch (error) {
                                        withdrawResponse.fee = fee;
                                    }
                                }
                            }
                            catch (error) {
                                logger.error(`Withdrawal failed: ${error.message}`);
                                throw new Error(`Withdrawal failed: ${error.message}`);
                            }
                        }
                    }
                    catch (error) {
                        logger.error(`Transfer failed: ${error.message}`);
                        throw new Error(`Transfer failed: ${error.message}`);
                    }
                    break;
                case 'binance':
                    try {
                        withdrawResponse = await exchange.withdraw(currency, withdrawAmount, address, memo, { network: chain });
                        withdrawResponse.fee = Number(withdrawResponse.fee) || fee;
                        switch (withdrawResponse.status) {
                            case 'ok':
                                withdrawStatus = types_1.TransactionStatus.COMPLETED;
                                break;
                            case 'canceled':
                                withdrawStatus = types_1.TransactionStatus.CANCELLED;
                                break;
                            case 'failed':
                                withdrawStatus = types_1.TransactionStatus.FAILED;
                            default:
                                withdrawStatus = types_1.TransactionStatus.PENDING;
                                break;
                        }
                    }
                    catch (error) {
                        logger.error(`Withdrawal failed: ${error.message}`);
                        throw new Error(`Withdrawal failed: ${error.message}`);
                    }
                    break;
                // other providers
                default:
                    break;
            }
            if (!withdrawResponse ||
                !withdrawResponse.id ||
                !withdrawStatus ||
                withdrawStatus === types_1.TransactionStatus.FAILED ||
                withdrawStatus === types_1.TransactionStatus.CANCELLED) {
                throw new Error('Withdrawal failed');
            }
            const updatedTransaction = (await prisma_1.default.transaction.update({
                where: {
                    uuid,
                },
                data: {
                    status: withdrawStatus,
                    reference_id: withdrawResponse.id,
                },
            }));
            try {
                const userData = (await (0, queries_1.getUserById)(user_id));
                (0, emails_1.sendSpotWalletWithdrawalConfirmationEmail)(userData, updatedTransaction, wallet);
            }
            catch (error) {
                logger.error(`Withdrawal confirmation email failed: ${error.message}`);
            }
            return {
                message: 'Withdrawal approved successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    rejectSpotWalletWithdrawal: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const { uuid } = params;
        const { message } = body;
        try {
            const transaction = (await prisma_1.default.transaction.findUnique({
                where: { uuid },
            }));
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            if (transaction.status !== 'PENDING') {
                throw new Error('Transaction is not pending');
            }
            const { wallet_id } = transaction;
            const updatedTransaction = (await prisma_1.default.transaction.update({
                where: {
                    uuid,
                },
                data: {
                    status: types_1.TransactionStatus.REJECTED,
                    metadata: {
                        ...transaction.metadata,
                        note: message || 'Withdrawal request rejected',
                    },
                },
            }));
            const updatedWallet = (await (0, queries_3.updateUserWalletBalance)(wallet_id, Number(updatedTransaction.amount), Number(updatedTransaction.fee), 'REFUND_WITHDRAWAL'));
            try {
                const user = await prisma_1.default.user.findUnique({
                    where: { id: transaction.user_id },
                });
                await (0, emails_1.sendTransactionStatusUpdateEmail)(user, updatedTransaction, updatedWallet, updatedWallet.balance, updatedTransaction.metadata?.note || 'Withdrawal request rejected');
            }
            catch (error) {
                console.error(error);
            }
            return {
                message: 'Withdrawal rejected successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
