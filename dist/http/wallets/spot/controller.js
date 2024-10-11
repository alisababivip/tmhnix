"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWalletAddressQuery = exports.verifyTransaction = exports.processPendingWithdrawals = exports.processPendingDeposits = exports.controllers = void 0;
const types_1 = require("../../../types");
const utils_1 = require("../../../utils");
const queries_1 = require("./queries");
const affiliate_1 = require("~~/utils/affiliate");
const logger_1 = require("../../../logger");
const emails_1 = require("../../../utils/emails");
const exchange_1 = __importDefault(require("../../../utils/exchange"));
const queries_2 = require("../../auth/queries");
const queries_3 = require("../../settings/queries");
const logger = (0, logger_1.createLogger)('Spot Wallets');
const verificationIntervals = new Map();
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getWalletQuery)(user.id, params.currency);
    }),
    store: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        const walletExists = await (0, queries_1.walletExistsQuery)(user.id, params.currency);
        if (walletExists) {
            throw new Error('Wallet already exists');
        }
        // Generate wallet address
        let addresses;
        try {
            addresses = await generateWalletAddressQuery(params.currency);
        }
        catch (error) {
            logger.error(`Failed to generate wallet address: ${error.message}`);
            throw new Error('Failed to generate wallet address, please contact support');
        }
        if (!addresses || !Object.keys(addresses).length) {
            logger.error(`Failed to generate wallet address`, addresses);
            throw new Error('Failed to generate wallet address, please try again');
        }
        return (0, queries_1.createWalletQuery)(user.id, params.currency, addresses);
    }),
    transactions: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.getTransactionQuery)(user.id, params.trx);
    }),
    deposit: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        const transactionExist = await (0, queries_1.transactionExistsQuery)(body.trx);
        if (transactionExist) {
            throw new Error('Transaction already exists');
        }
        const transaction = await (0, queries_1.createTransaction)(user.id, {
            wallet_id: body.wallet_id,
            reference_id: body.trx,
            amount: 0,
            metadata: {
                chain: body.chain,
            },
            type: 'DEPOSIT',
        });
        if (!transaction) {
            throw new Error('Transaction not created');
        }
        // Start the verification schedule for this transaction
        startVerificationSchedule(Number(transaction.id), user.id, body.trx);
        return transaction;
    }),
    depositVerify: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        return verifyTransaction(user.id, params.trx);
    }),
    depositCancel: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        // Find third-party transaction by transaction ID
        const transaction = await (0, queries_1.getTransactionQuery)(user.id, params.trx);
        // Return error response if transaction not found
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        if (transaction.status === types_1.TransactionStatus.CANCELLED) {
            // Stop the verification schedule for this transaction
            stopVerificationSchedule(Number(transaction.id));
            throw new Error('Transaction already cancelled');
        }
        const updatedTransaction = await (0, queries_1.updateTransaction)(transaction.id, types_1.TransactionStatus.CANCELLED);
        return updatedTransaction;
    }),
    withdraw: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        // Validate required fields
        const { amount, address, currency, chain, memo } = body;
        if (!amount || !address || !currency) {
            throw new Error('Invalid input');
        }
        // Fetch the user's wallet
        const wallet = await (0, queries_1.getWalletQuery)(user.id, currency);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        const currencyData = await (0, queries_1.getCurrency)(currency);
        if (!currencyData) {
            throw new Error('Currency not found');
        }
        const fee = currencyData.chains?.find((c) => c.network === chain)?.withdrawFee || 0;
        const withdrawAmount = Number(amount) + Number(fee);
        if (withdrawAmount > wallet.balance) {
            throw new Error('Your withdraw amount including fees is higher than your balance');
        }
        const settings = await (0, queries_3.getSettings)();
        const settingsObject = Object.fromEntries(settings.map((s) => [s.key, s.value]));
        // Check withdrawal setting
        let updatedWallet, transaction, message;
        if (settingsObject['spot_wallet_withdrawal'] === 'Manual') {
            updatedWallet = (await (0, queries_1.updateWalletBalance)(user.id, currency, Number(amount), Number(fee), 'WITHDRAWAL'));
            if (!updatedWallet) {
                throw new Error('Wallet not updated');
            }
            // Implement your transaction and notification logic here
            transaction = (await (0, queries_1.createTransaction)(user.id, {
                wallet_id: wallet.id,
                amount: Number(amount),
                fee: parseFloat(fee),
                metadata: {
                    address: address,
                    currency: currency,
                    chain: chain,
                    memo: memo,
                },
                description: `Withdrawl of ${amount} ${currency} to ${address}`,
                type: types_1.TransactionType.WITHDRAW,
                status: types_1.TransactionStatus.PENDING,
            }));
            if (!transaction) {
                throw new Error('Transaction not created');
            }
            message = 'Withdrawal request received. It will be processed manually.';
        }
        else {
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
                                throw new Error('Withdrawal failed');
                            }
                        }
                    }
                    catch (error) {
                        logger.error(`Transfer failed: ${error.message}`);
                        throw new Error('Transfer failed');
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
                        throw new Error('Withdrawal failed');
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
            // Update wallet balance
            updatedWallet = (await (0, queries_1.updateWalletBalance)(user.id, currency, Number(amount), Number(withdrawResponse.fee), 'WITHDRAWAL'));
            if (!updatedWallet) {
                throw new Error('Wallet not updated');
            }
            // Implement your transaction and notification logic here
            transaction = (await (0, queries_1.createTransaction)(user.id, {
                wallet_id: wallet.id,
                reference_id: withdrawResponse.id,
                amount: Number(amount),
                fee: parseFloat(withdrawResponse.fee),
                metadata: {
                    address: address,
                    currency: currency,
                    chain: chain,
                    memo: memo,
                },
                type: types_1.TransactionType.WITHDRAW,
                status: withdrawStatus,
            }));
            if (!transaction) {
                throw new Error('Transaction not created');
            }
            try {
                const userData = (await (0, queries_2.getUserById)(user.id));
                (0, emails_1.sendSpotWalletWithdrawalConfirmationEmail)(userData, transaction, updatedWallet);
            }
            catch (error) {
                logger.error(`Withdrawal confirmation email failed: ${error.message}`);
            }
            message = 'Withdraw request placed successfully';
        }
        return {
            message: message,
            transaction: transaction,
            wallet: updatedWallet,
        };
    }),
    depositCron: (0, utils_1.handleController)(async () => {
        try {
            await processPendingDeposits();
            return {
                message: 'Deposit cron executed successfully.',
            };
        }
        catch (error) {
            throw new Error(error);
        }
    }),
    withdrawCron: (0, utils_1.handleController)(async () => {
        try {
            await processPendingWithdrawals();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
async function processPendingDeposits() {
    const transactions = await (0, queries_1.getPendingTransactionsQuery)(types_1.TransactionType.DEPOSIT);
    for (const transaction of transactions) {
        const transactionId = Number(transaction.id); // Convert to number as your map keys are numbers
        const userId = transaction.user_id;
        const trx = transaction.reference_id;
        // Only start a new verification schedule if it's not already running
        if (!verificationIntervals.has(transactionId)) {
            startVerificationSchedule(transactionId, userId, trx);
        }
    }
}
exports.processPendingDeposits = processPendingDeposits;
async function processPendingWithdrawals() {
    const transactions = await (0, queries_1.getPendingTransactionsQuery)(types_1.TransactionType.WITHDRAW);
    for (const transaction of transactions) {
        const userId = transaction.user_id;
        const trx = transaction.reference_id;
        if (!trx)
            return;
        const exchange = await exchange_1.default.startExchange();
        try {
            const withdrawals = await exchange.fetchWithdrawals(transaction.wallet?.currency);
            const withdrawData = withdrawals.find((w) => w.id === trx);
            let withdrawStatus;
            if (withdrawData) {
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
            if (!withdrawStatus) {
                return;
            }
            if (transaction.status === withdrawStatus) {
                return;
            }
            await (0, queries_1.updateTransaction)(transaction.id, withdrawStatus);
            if (withdrawStatus === types_1.TransactionStatus.FAILED ||
                withdrawStatus === types_1.TransactionStatus.CANCELLED) {
                await (0, queries_1.updateWalletBalance)(userId, transaction.wallet?.currency, Number(transaction.amount), Number(transaction.fee), 'REFUND_WITHDRAWAL');
            }
        }
        catch (error) {
            logger.error(`Withdrawal failed: ${error.message}`);
            return;
        }
    }
}
exports.processPendingWithdrawals = processPendingWithdrawals;
async function verifyTransaction(userId, trx) {
    const transaction = (await (0, queries_1.getTransactionQuery)(userId, trx));
    // Return error response if transaction not found
    if (!transaction) {
        throw new Error('Transaction not found');
    }
    if (transaction.status === types_1.TransactionStatus.COMPLETED) {
        stopVerificationSchedule(Number(transaction.id));
        return;
    }
    // Initialize exchange
    const exchange = await exchange_1.default.startExchange();
    const provider = await exchange_1.default.provider;
    let deposits = []; // Initialize to an empty array
    try {
        switch (provider) {
            case 'kucoin':
            case 'binance':
            case 'bitget':
                deposits = await exchange.fetch_deposits(transaction.wallet?.currency);
                break;
            case 'coinbasepro':
                deposits = await exchange.fetch_transactions();
                break;
        }
    }
    catch (error) {
        console.error('Error fetching deposits or transactions:', error);
        return; // Exit the function if we can't fetch deposits
    }
    // Now, deposits is guaranteed to be an array (possibly empty)
    const deposit = deposits.find((d) => d.txid === transaction.reference_id);
    if (!deposit) {
        return;
    }
    if (deposit.status !== 'ok') {
        return;
    }
    const amount = deposit.amount;
    const fee = deposit.fee?.cost || 0;
    if (provider === 'kucoin' || provider === 'binance') {
        if (transaction.wallet?.currency !== deposit.currency) {
            stopVerificationSchedule(transaction.id);
            await (0, queries_1.deleteTransaction)(transaction.id);
            return;
        }
    }
    if (transaction.status === types_1.TransactionStatus.COMPLETED) {
        stopVerificationSchedule(Number(transaction.id));
        return;
    }
    const settings = await (0, queries_3.getSettings)();
    const settingsObject = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (settingsObject['deposit_expiration'] &&
        settingsObject['deposit_expiration'] === 'Enabled') {
        const createdAt = deposit.timestamp / 1000;
        const transactionCreatedAt = new Date(transaction.created_at).getTime() / 1000;
        const currentTime = Date.now() / 1000;
        const timeDiff = (currentTime - createdAt) / 60; // Difference in minutes
        if (createdAt < transactionCreatedAt - 900 ||
            createdAt > transactionCreatedAt + 900 ||
            timeDiff > 45) {
            stopVerificationSchedule(transaction.id);
            await (0, queries_1.updateTransaction)(transaction.id, types_1.TransactionStatus.TIMEOUT, {
                amount: amount,
            });
            return;
        }
    }
    // update the amount and fee of the transaction using the deposit data
    await (0, queries_1.updateTransaction)(transaction.id, types_1.TransactionStatus.COMPLETED, {
        amount: amount,
        fee: fee,
    });
    // Update the wallet balance
    const updatedWallet = (await (0, queries_1.updateWalletBalance)(userId, transaction.wallet?.currency, amount, fee, types_1.TransactionType.DEPOSIT));
    // Transfer the amount from main to trade account within KuCoin
    if (provider === 'kucoin') {
        try {
            // Transferring the amount from main to trade account within KuCoin
            await exchange.transfer(transaction.wallet?.currency, deposit.amount, 'main', 'trade');
        }
        catch (error) {
            logger.error(`Transfer failed: ${error.message}`);
        }
    }
    const userData = (await (0, queries_2.getUserById)(userId));
    try {
        (0, emails_1.sendSpotWalletDepositConfirmationEmail)(userData, transaction, updatedWallet);
    }
    catch (error) {
        logger.error(`Deposit confirmation email failed: ${error.message}`);
    }
    try {
        await (0, affiliate_1.processRewards)(userData.uuid, amount, 'WELCOME_BONUS', transaction.wallet?.currency, settingsObject);
    }
    catch (error) {
        logger.error(`Error processing rewards: ${error.message}`);
    }
    return;
}
exports.verifyTransaction = verifyTransaction;
async function generateWalletAddressQuery(currency) {
    const exchange = await exchange_1.default.startExchange();
    const provider = await exchange_1.default.provider;
    const connection = await exchange.checkRequiredCredentials();
    if (!connection) {
        logger.error(`Exchange connection failed, please check your credentials`);
        throw new Error('Exchange connection failed');
    }
    const results = {};
    switch (provider) {
        case 'binance':
            const curr = await (0, queries_1.getCurrency)(currency);
            if (!curr || !curr.chains) {
                throw new Error('Chains information is missing');
            }
            if (curr.chains.length > 1) {
                // Run all address generation promises in parallel
                const promises = curr.chains.map((chain) => {
                    const chainName = exchange.safeString(chain, 'network');
                    return fetchCreateDepositAddress(exchange, currency, chainName)
                        .then((address) => {
                        results[chainName] = address;
                    })
                        .catch((error) => {
                        logger.error(`Error creating ${chainName} address: ${error.message}`);
                    });
                });
                // Wait for all promises to complete
                await Promise.all(promises);
            }
            else {
                const chain = exchange.safeValue(curr.chains, 0);
                const chainName = exchange.safeString(chain, 'network');
                try {
                    const address = await fetchCreateDepositAddress(exchange, currency, chainName);
                    results[chainName] = address;
                }
                catch (error) {
                    logger.error(`Error creating ${chainName} address: ${error.message}`);
                }
            }
            break;
        case 'kucoin':
            try {
                const response = await exchange.publicGetCurrenciesCurrency({
                    currency,
                });
                logger.info('Kucoin API Response: ' + JSON.stringify(response));
                const currencyData = exchange.safeValue(response, 'data');
                if (!currencyData) {
                    throw new Error('Currency data is missing from the Kucoin response');
                }
                const chains = exchange.safeValue(currencyData, 'chains');
                if (!chains || chains.length === 0) {
                    throw new Error('Chain data is missing from the currency data in Kucoin response');
                }
                const addressPromises = chains.map(async (chain) => {
                    const chainName = exchange.safeString(chain, 'chainName');
                    if (!chainName) {
                        logger.warn('Chain name is missing for a chain in the Kucoin response');
                        return;
                    }
                    try {
                        const address = await fetchCreateDepositAddress(exchange, currency, chainName.toUpperCase());
                        results[chainName.toUpperCase()] = {
                            currency: address.currency,
                            address: address.address,
                            tag: address.tag,
                            network: address.network,
                        };
                    }
                    catch (error) {
                        logger.error(`Error creating ${chainName.toUpperCase()} address: ${error.message}`);
                    }
                });
                await Promise.all(addressPromises);
                // Check if any address has been added
                if (Object.keys(results).length === 0) {
                    throw new Error('No addresses were generated for Kucoin');
                }
            }
            catch (error) {
                logger.error('Kucoin provider error: ' + error.message);
                throw error;
            }
            logger.info('Generated Addresses: ' + JSON.stringify(results));
            break;
        default:
            throw new Error('Provider not supported');
    }
    return results;
}
exports.generateWalletAddressQuery = generateWalletAddressQuery;
function fetchCreateDepositAddress(exchange, currency, chain = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetchCreateDepositAddressHelper(exchange, currency, chain);
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    });
}
function fetchCreateDepositAddressHelper(exchange, currency, chain = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await exchange.fetchDepositAddress(currency, chain ? { network: chain.toLowerCase() } : {});
            if (!response.address || !response.address.length) {
                throw new Error('No wallet address found');
            }
            resolve(response);
        }
        catch (error) {
            try {
                const response = await exchange.createDepositAddress(currency, chain ? { network: chain.toLowerCase() } : {});
                resolve(response);
            }
            catch (error) {
                reject(error);
            }
        }
    });
}
function startVerificationSchedule(transactionId, userId, trx) {
    // Clear any existing interval for this transaction (if any)
    const existingInterval = verificationIntervals.get(transactionId);
    if (existingInterval) {
        clearInterval(existingInterval);
    }
    // Schedule the verifyTransaction function to run every 30 seconds
    const interval = setInterval(() => {
        verifyTransaction(userId, trx).catch((error) => {
            console.error('Error verifying transaction:', error);
        });
    }, 30000);
    // Store the interval in the map
    verificationIntervals.set(transactionId, interval);
    // Stop the verification schedule after 30 minutes
    setTimeout(() => {
        stopVerificationSchedule(transactionId);
    }, 1800000); // 30 minutes in milliseconds
}
function stopVerificationSchedule(transactionId) {
    const interval = verificationIntervals.get(transactionId);
    if (interval) {
        clearInterval(interval);
        verificationIntervals.delete(transactionId);
    }
}
