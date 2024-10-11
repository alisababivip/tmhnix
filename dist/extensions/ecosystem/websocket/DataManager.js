"use strict";
// dataManager.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const queries_1 = require("~~/http/wallets/queries");
const logger_1 = require("../../../logger");
const queries_2 = require("../user/tokens/queries");
const queries_3 = require("../user/wallets/queries");
const utils_1 = require("../utils");
const blockchain_1 = require("../utils/blockchain");
const provider_1 = require("../utils/provider");
const transactions_1 = require("../utils/transactions");
const utxo_1 = require("../utils/utxo");
const websocket_1 = require("../utils/websocket");
const ClientConnection_1 = __importDefault(require("./ClientConnection"));
const logger = (0, logger_1.createLogger)('Ecosystem DataManager');
class DataManager {
    static instance = null;
    clientConnection;
    chainProviders = new Map();
    constructor(clientConnection) {
        this.clientConnection = clientConnection;
    }
    async handleOrderBroadcast(order) {
        // Notify the clients about their order updates based on User UUID
        const interestedInOrder = await this.clientConnection.getInterestedClientsByUserId(order.user_id.toString());
        const filteredOrder = {
            ...order,
            price: (0, blockchain_1.fromBigInt)(order.price),
            amount: (0, blockchain_1.fromBigInt)(order.amount),
            filled: (0, blockchain_1.fromBigInt)(order.filled),
            remaining: (0, blockchain_1.fromBigInt)(order.remaining),
            cost: (0, blockchain_1.fromBigInt)(order.cost),
            fee: (0, blockchain_1.fromBigInt)(order.fee),
            average: (0, blockchain_1.fromBigInt)(order.average),
        };
        // Broadcast the filtered order information to interested clients
        this.broadcastToClients(interestedInOrder, {
            type: 'orders',
            result: filteredOrder,
        });
    }
    async handleTickerBroadcast(symbol, ticker) {
        const identifier = (0, websocket_1.generateIdentifier)('watchTicker', { symbol });
        const interestedClients = await this.clientConnection.getInterestedClients('watchTicker', identifier);
        this.broadcastToClients(interestedClients, {
            type: 'ticker',
            symbol,
            result: ticker,
        });
    }
    async handleCandleBroadcast(symbol, interval, candle) {
        const identifier = (0, websocket_1.generateIdentifier)('watchCandles', { symbol, interval });
        const interestedClients = await this.clientConnection.getInterestedClients('watchCandles', identifier);
        this.broadcastToClients(interestedClients, {
            type: 'candles',
            symbol,
            interval,
            result: candle,
        });
    }
    async handleOrderBookUpdate(symbol, book) {
        try {
            const identifier = (0, websocket_1.generateIdentifier)('watchOrderBook', { symbol });
            const interestedClients = await this.clientConnection.getInterestedClients('watchOrderBook', identifier);
            if (!book) {
                logger.error('Book is undefined');
                return;
            }
            const orderbook = {
                asks: Object.entries(book.asks || {}).map(([price, amount]) => [
                    (0, blockchain_1.fromWei)(Number(price)),
                    (0, blockchain_1.fromWei)(Number(amount)),
                ]),
                bids: Object.entries(book.bids || {}).map(([price, amount]) => [
                    (0, blockchain_1.fromWei)(Number(price)),
                    (0, blockchain_1.fromWei)(Number(amount)),
                ]),
            };
            this.broadcastToClients(interestedClients, {
                type: 'orderbook',
                symbol,
                result: orderbook,
            });
        }
        catch (error) {
            logger.error(`Failed to fetch and broadcast order book: ${error}`);
        }
    }
    async handleTickersBroadcast(tickers) {
        const interestedClients = await this.clientConnection.getInterestedClients('watchTickers', 'tickers');
        this.broadcastToClients(interestedClients, {
            type: 'tickers',
            result: tickers,
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DataManager(ClientConnection_1.default.getInstance());
        }
        return this.instance;
    }
    async removeUnusedChainProviders(chain) {
        if (this.chainProviders.has(chain)) {
            const provider = this.chainProviders.get(chain);
            if (provider) {
                provider.removeAllListeners();
            }
            this.chainProviders.delete(chain);
        }
    }
    async initializeProvider(chain) {
        try {
            let attempts = 0;
            let provider = null;
            while (attempts < 3) {
                provider = (0, utils_1.getWssProvider)(chain);
                const isHealthy = await (0, provider_1.isProviderHealthy)(provider);
                if (isHealthy) {
                    return provider;
                }
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            this.removeUnusedChainProviders(chain);
            return null;
        }
        catch (error) {
            logger.error(`Error in initializeProvider: ${error.message}`);
        }
    }
    async watchDeposits(chain, address, uuid, currency, contractType) {
        try {
            let provider;
            if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(chain)) {
                (0, utxo_1.watchAddressBlockCypher)(chain, address, async (transaction) => {
                    try {
                        // Assuming walletId is available in your context
                        const wallet = await (0, queries_1.getWallet)(uuid);
                        // Process transaction details
                        const txDetails = await (0, utxo_1.createTransactionDetailsForUTXO)(uuid, transaction, address, chain);
                        await this.storeAndBroadcastTransaction(txDetails, transaction.hash);
                        // Record UTXOs
                        transaction.outputs.forEach((output, index) => {
                            if (output.addresses.includes(address)) {
                                (0, utxo_1.recordUTXO)(wallet.id, transaction.hash, index, output.value, output.script, false);
                            }
                        });
                    }
                    catch (error) {
                        logger.error(`Error in processUTXOTransaction: ${error.message}`);
                    }
                });
            }
            else {
                const provider = await this.initializeProvider(chain);
                if (!provider) {
                    return;
                }
                this.chainProviders.set(chain, provider);
                let filter, decimals;
                const feeDecimals = utils_1.chainConfigs[chain].decimals;
                let depositFound = false;
                if (contractType === 'NATIVE') {
                    decimals = utils_1.chainConfigs[chain].decimals;
                    let startTime = Math.floor(Date.now() / 1000);
                    const verifyDeposits = async () => {
                        if (depositFound) {
                            return;
                        }
                        const transactions = await (0, transactions_1.fetchTransactions)(chain, address);
                        for (const tx of transactions) {
                            if (tx.to &&
                                tx.to.toLowerCase() === address.toLowerCase() &&
                                Number(tx.timestamp) > startTime &&
                                Number(tx.status) === 1) {
                                depositFound = true;
                                try {
                                    const txDetails = await this.createTransactionDetails(uuid, tx, address, chain, decimals, feeDecimals, 'DEPOSIT');
                                    await this.storeAndBroadcastTransaction(txDetails, tx.hash);
                                }
                                catch (error) {
                                    logger.error(`Error in processNativeTransaction: ${error.message}, Transaction Hash: ${tx.hash}`);
                                }
                                startTime = Math.floor(Date.now() / 1000);
                                break;
                            }
                        }
                    };
                    verifyDeposits();
                    const intervalId = setInterval(verifyDeposits, 10000);
                    const checkDepositFound = () => {
                        if (depositFound) {
                            clearInterval(intervalId); // Clear the interval if deposit is found
                        }
                        else {
                            setTimeout(checkDepositFound, 1000); // Check again after a delay
                        }
                    };
                    checkDepositFound();
                }
                else {
                    // For ERC-20 token transfers, use the contract's address and Transfer event topics
                    const token = await (0, queries_2.getToken)(chain, currency);
                    if (!token) {
                        logger.error(`Token ${currency} not found`);
                        return;
                    }
                    decimals = token.decimals;
                    filter = {
                        address: token.contract,
                        topics: [
                            ethers_1.ethers.id('Transfer(address,address,uint256)'),
                            null,
                            address ? ethers_1.ethers.zeroPadValue(address, 32) : null,
                        ],
                    };
                    let eventListener = null;
                    const stopEventListener = () => {
                        if (eventListener) {
                            provider.off(filter, eventListener);
                        }
                    };
                    eventListener = async (log, event) => {
                        try {
                            await this.processTransaction(uuid, log.transactionHash, provider, address, chain, decimals, feeDecimals);
                            stopEventListener(); // Stop listening for further events
                        }
                        catch (error) {
                            logger.error(`Error in pending handler: ${error.message}`);
                        }
                    };
                    provider.on(filter, eventListener);
                }
                provider.on('error', (error) => {
                    logger.error(`Provider error: ${error.message}`);
                });
            }
            // Start verifying pending transactions
            this.verifyPendingTransactions(provider);
            this.clientConnection.checkSubscriptions();
        }
        catch (error) {
            logger.error(`Error in watchDeposits: ${error.message}`);
        }
    }
    async processTransaction(uuid, txHash, provider, address, chain, decimals, feeDecimals) {
        try {
            const tx = await provider.getTransaction(txHash);
            if (!tx || !tx.data)
                return;
            const decodedData = (0, blockchain_1.decodeTransactionData)(tx.data);
            const realTo = decodedData.to || tx.to;
            const amount = decodedData.amount || tx.value;
            if (!realTo || realTo.toLowerCase() !== address.toLowerCase())
                return;
            const txDetails = await this.createTransactionDetails(uuid, tx, realTo, chain, decimals, feeDecimals, 'DEPOSIT', amount);
            await this.storeAndBroadcastTransaction(txDetails, txHash);
        }
        catch (error) {
            logger.error(`Error in processTransaction: ${error.message}, Transaction Hash: ${txHash}`);
        }
    }
    async createTransactionDetails(uuid, tx, toAddress, chain, decimals, feeDecimals, type, amount = tx.amount) {
        const formattedAmount = ethers_1.ethers.formatUnits(amount.toString(), decimals);
        const formattedGasLimit = tx.gasLimit ? tx.gasLimit.toString() : 'N/A';
        const formattedGasPrice = tx.gasPrice
            ? ethers_1.ethers.formatUnits(tx.gasPrice.toString(), feeDecimals)
            : 'N/A';
        return {
            uuid,
            chain,
            hash: tx.hash,
            type,
            from: tx.from,
            to: toAddress,
            amount: formattedAmount,
            gasLimit: formattedGasLimit,
            gasPrice: formattedGasPrice,
        };
    }
    async storeAndBroadcastTransaction(txDetails, txHash) {
        const pendingTransactions = (await (0, websocket_1.loadFromRedis)('pendingTransactions')) || {};
        pendingTransactions[txHash] = txDetails;
        await (0, websocket_1.offloadToRedis)('pendingTransactions', pendingTransactions);
        const identifier = (0, websocket_1.generateIdentifier)('watchDeposits', {
            chain: txDetails.chain,
            address: txDetails.address || txDetails.to,
        });
        const interestedClients = await this.clientConnection.getInterestedClients('watchDeposits', identifier);
        this.broadcastToClients(interestedClients, {
            type: 'deposits',
            result: txDetails,
        });
    }
    async verifyPendingTransactions(provider) {
        const processingTransactions = new Set();
        while (true) {
            try {
                const pendingTransactions = (await (0, websocket_1.loadFromRedis)('pendingTransactions')) || {};
                if (Object.keys(pendingTransactions).length === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    continue;
                }
                const txHashes = Object.keys(pendingTransactions);
                const verificationPromises = txHashes.map(async (txHash) => {
                    if (processingTransactions.has(txHash)) {
                        return;
                    }
                    try {
                        const txDetails = pendingTransactions[txHash];
                        if (!txDetails) {
                            return;
                        }
                        if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(txDetails.chain) &&
                            !txDetails.address) {
                            delete pendingTransactions[txHash];
                            await (0, websocket_1.offloadToRedis)('pendingTransactions', pendingTransactions);
                            return;
                        }
                        processingTransactions.add(txHash);
                        const identifier = (0, websocket_1.generateIdentifier)('watchDeposits', {
                            chain: txDetails.chain,
                            address: txDetails.address || txDetails.to,
                        });
                        const interestedClients = await this.clientConnection.getInterestedClients('watchDeposits', identifier);
                        let toBroadcast = true;
                        if (interestedClients.length === 0) {
                            toBroadcast = false;
                        }
                        let isConfirmed, updatedTxDetails;
                        if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(txDetails.chain)) {
                            // Verify UTXO chain transactions
                            const data = await (0, utxo_1.verifyUTXOTransaction)(txDetails.chain, txHash);
                            isConfirmed = data.confirmed;
                            const status = isConfirmed ? 'COMPLETED' : 'FAILED';
                            updatedTxDetails = {
                                ...txDetails,
                                status,
                            };
                        }
                        else {
                            // Existing logic for EVM chains
                            const receipt = await provider.getTransactionReceipt(txHash);
                            if (!receipt) {
                                processingTransactions.delete(txHash); // Remove from processing if receipt not found
                                return;
                            }
                            isConfirmed = receipt && receipt.status === 1;
                            const status = isConfirmed ? 'COMPLETED' : 'FAILED';
                            updatedTxDetails = {
                                ...txDetails,
                                gasUsed: receipt.gasUsed.toString(),
                                status,
                            };
                        }
                        if (isConfirmed) {
                            try {
                                const response = await (0, queries_3.handleDeposit)(updatedTxDetails);
                                if (!response) {
                                    logger.info(`Transaction ${txHash} failed to handle deposit`);
                                }
                            }
                            catch (error) {
                                logger.error(`Error handling deposit for transaction ${txHash}: ${error.message}`);
                            }
                        }
                        if (toBroadcast) {
                            this.broadcastToClients(interestedClients, {
                                type: 'deposits',
                                result: updatedTxDetails,
                            });
                        }
                        delete pendingTransactions[txHash];
                        await (0, websocket_1.offloadToRedis)('pendingTransactions', pendingTransactions);
                    }
                    catch (error) {
                        logger.error(`Error verifying transaction ${txHash}: ${error.message}`);
                    }
                    finally {
                        processingTransactions.delete(txHash);
                    }
                });
                await Promise.all(verificationPromises);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            catch (error) {
                logger.error(`Error in verifyPendingTransactions: ${error.message}`);
            }
        }
    }
    async broadcastToClients(clients, message) {
        clients.forEach((client) => {
            client.sendToClient(message);
        });
    }
}
exports.default = DataManager;
