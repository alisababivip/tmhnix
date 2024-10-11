"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUTXOWithdrawal = exports.getCurrentFeeRatePerByte = exports.calculateUTXOFee = exports.broadcastRawTransaction = exports.verifyUTXOTransaction = exports.fetchTransaction = exports.fetchRawTransaction = exports.fetchUTXOWalletBalance = exports.fetchUTXOTransactions = exports.createUTXOWallet = exports.recordUTXO = exports.createTransactionDetailsForUTXO = exports.cancelWatchAddress = exports.watchAddressBlockCypher = void 0;
/* eslint-disable prettier-vue/prettier */
const assert = __importStar(require("assert"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const ecc = __importStar(require("tiny-secp256k1"));
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("~~/logger");
const encrypt_1 = require("~~/utils/encrypt");
const prisma_1 = __importDefault(require("../../../utils/prisma"));
const queries_1 = require("../admin/wallets/queries");
const blockchain_1 = require("./blockchain");
const logger = (0, logger_1.createLogger)('UTXO');
const HTTP_TIMEOUT = 30000;
const BLOCKCYPHER_API_URL = 'https://api.blockcypher.com/v1';
const BTC_NETWORK = process.env.BTC_NETWORK || 'mainnet';
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN;
const BTC_NODE = process.env.BTC_NODE || 'blockcypher';
const LTC_NODE = process.env.LTC_NODE || 'blockcypher';
const DOGE_NODE = process.env.DOGE_NODE || 'blockcypher';
const DASH_NODE = process.env.DASH_NODE || 'blockcypher';
const wsConnections = new Map();
const ECPair = (0, ecpair_1.default)(ecc);
// Utility function to get the network object
function getNetwork(chain) {
    switch (chain) {
        case 'BTC':
            return BTC_NETWORK === 'mainnet'
                ? bitcoin.networks.bitcoin
                : bitcoin.networks.testnet;
        case 'LTC':
            return blockchain_1.litecoinNetwork;
        case 'DOGE':
            return blockchain_1.dogecoinNetwork;
        case 'DASH':
            return blockchain_1.dashNetwork;
        default:
            throw new Error(`Unsupported UTXO chain: ${chain}`);
    }
}
const getProvider = (chain) => {
    switch (chain) {
        case 'BTC':
            return BTC_NODE;
        case 'LTC':
            return LTC_NODE;
        case 'DOGE':
            return DOGE_NODE;
        case 'DASH':
            return DASH_NODE;
        default:
            return 'blockcypher';
    }
};
const providers = {
    haskoin: {
        BTC: `https://api.haskoin.com/btc${BTC_NETWORK === 'mainnet' ? '' : 'test'}`,
    },
    blockcypher: {
        BTC: `https://api.blockcypher.com/v1/btc/${BTC_NETWORK === 'mainnet' ? 'main' : 'test3'}`,
        LTC: 'https://api.blockcypher.com/v1/ltc/main',
        DASH: 'https://api.blockcypher.com/v1/dash/main',
        DOGE: 'https://api.blockcypher.com/v1/doge/main',
    },
};
// Utility function to watch an address for new transactions
const watchAddressBlockCypher = (chain, address, callback) => {
    const network = chain === 'BTC' ? (BTC_NETWORK === 'mainnet' ? 'main' : 'test3') : 'main';
    const ws = new ws_1.default(`wss://socket.blockcypher.com/v1/${chain.toLowerCase()}/${network}?token=${BLOCKCYPHER_TOKEN}`);
    ws.on('open', function open() {
        console.log(`WebSocket connected for ${chain}. Subscribing to address: ${address}`);
        ws.send(JSON.stringify({ event: 'unconfirmed-tx', address: address }));
    });
    ws.on('message', function incoming(data) {
        const messageString = data.toString();
        const message = JSON.parse(messageString);
        if (message && message.hash) {
            callback(message);
            (0, exports.cancelWatchAddress)(chain, address); // Close the WebSocket after receiving the transaction
        }
    });
    ws.on('close', function close() {
        console.log(`WebSocket disconnected from ${chain} address: ${address}`);
    });
    ws.on('error', function error(err) {
        console.error(`WebSocket error for ${chain} address ${address}:`, err);
    });
    // Store the WebSocket connection
    const wsKey = `${chain}_${address}`;
    wsConnections.set(wsKey, ws);
};
exports.watchAddressBlockCypher = watchAddressBlockCypher;
// Utility function to cancel a WebSocket connection
const cancelWatchAddress = (chain, address) => {
    const wsKey = `${chain}_${address}`;
    const ws = wsConnections.get(wsKey);
    if (ws) {
        try {
            ws.close();
            console.log(`WebSocket for ${chain} address ${address} has been successfully closed.`);
        }
        catch (error) {
            console.error(`Error closing WebSocket for ${chain} address ${address}:`, error.message);
        }
        finally {
            wsConnections.delete(wsKey);
        }
    }
    else {
        console.log(`No active WebSocket found for ${chain} address ${address}.`);
    }
};
exports.cancelWatchAddress = cancelWatchAddress;
// Utility function to create a transaction object
async function createTransactionDetailsForUTXO(uuid, transaction, address, chain) {
    // Extracting the necessary information from the transaction object
    const txHash = transaction.hash;
    // Include all input addresses
    const inputs = transaction.inputs.map((input) => ({
        prevHash: input.prev_hash,
        outputIndex: input.output_index,
        value: (0, blockchain_1.satoshiToStandardUnit)(input.output_value, chain),
        addresses: input.addresses,
        script: input.script,
    }));
    // Filter outputs that include the address
    const outputs = transaction.outputs
        .filter((output) => output.addresses.includes(address))
        .map((output) => ({
        value: (0, blockchain_1.satoshiToStandardUnit)(output.value, chain),
        addresses: output.addresses,
        script: output.script,
    }));
    // Sum of all output values that are relevant to the address
    const amount = outputs.reduce((acc, output) => acc + output.value, 0);
    // Creating a formatted transaction detail object
    const txDetails = {
        uuid,
        address,
        chain,
        hash: txHash,
        from: inputs.map((input) => input.addresses).flat(),
        to: outputs.map((output) => output.addresses).flat(),
        amount,
        inputs,
        outputs,
    };
    return txDetails;
}
exports.createTransactionDetailsForUTXO = createTransactionDetailsForUTXO;
// Utility function to record a UTXO transaction
async function recordUTXO(walletId, transactionId, index, amount, script, status) {
    try {
        await prisma_1.default.ecosystem_utxo.create({
            data: {
                wallet_id: walletId,
                transaction_id: transactionId,
                index: index,
                amount: amount,
                script: script,
                status: status,
            },
        });
    }
    catch (error) {
        logger.error(`Error recording UTXO: ${error.message}`);
    }
}
exports.recordUTXO = recordUTXO;
// Utility function to construct the API URL
const constructApiUrl = (chain, operation, address = '', txHash = '', provider = '') => {
    if (provider === '')
        provider = getProvider(chain);
    switch (provider) {
        case 'haskoin': {
            const haskoinBaseURL = providers.haskoin[chain];
            switch (operation) {
                case 'fetchBalance':
                    return `${haskoinBaseURL}/address/${address}/balance`;
                case 'fetchTransactions':
                    return `${haskoinBaseURL}/address/${address}/transactions/full`;
                case 'fetchTransaction':
                    return `${haskoinBaseURL}/transaction/${txHash}`;
                case 'fetchRawTransaction':
                    return `${haskoinBaseURL}/transaction/${txHash}/raw`;
                case 'broadcastTransaction':
                    return `${haskoinBaseURL}/transactions/full`;
                default:
                    throw new Error(`Unsupported operation for Haskoin: ${operation}`);
            }
        }
        case 'blockcypher':
        default: {
            const blockcypherBaseURL = providers.blockcypher[chain];
            switch (operation) {
                case 'fetchBalance':
                    return `${blockcypherBaseURL}/addrs/${address}/balance`;
                case 'fetchTransactions':
                    return `${blockcypherBaseURL}/addrs/${address}`;
                case 'fetchTransaction':
                    return `${blockcypherBaseURL}/txs/${txHash}`;
                case 'fetchRawTransaction':
                    return `${blockcypherBaseURL}/txs/${txHash}?includeHex=true`;
                case 'broadcastTransaction':
                    return `${blockcypherBaseURL}/txs/push`;
                default:
                    throw new Error(`Unsupported operation for BlockCypher: ${operation}`);
            }
        }
    }
};
// Generic function to perform the fetch operation
const fetchFromApi = async (url, options = {}) => {
    try {
        const response = await (0, node_fetch_1.default)(url, options);
        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response structure');
        }
        return data;
    }
    catch (error) {
        console.error(`Error fetching from API: ${error.message}`);
        throw error;
    }
};
// Utility function to create a new UTXO wallet
const createUTXOWallet = (chain) => {
    const network = getNetwork(chain);
    if (!network) {
        throw new Error(`Unsupported UTXO chain: ${chain}`);
    }
    const keyPair = ECPair.makeRandom({ network });
    const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
    });
    if (chain === 'BTC' && network === bitcoin.networks.testnet) {
        assert.strictEqual(address.startsWith('m') || address.startsWith('n'), true);
    }
    const privateKey = keyPair.toWIF();
    return {
        address,
        data: {
            privateKey,
        },
    };
};
exports.createUTXOWallet = createUTXOWallet;
// Utility function to fetch the UTXO transactions for an address
const fetchUTXOTransactions = async (chain, address) => {
    const url = constructApiUrl(chain, 'fetchTransactions', address, '');
    const data = await fetchFromApi(url, { timeout: HTTP_TIMEOUT });
    const provider = getProvider(chain);
    switch (provider) {
        case 'haskoin':
            // Map Haskoin's response format to BlockCypher style
            return data.map((tx) => ({
                hash: tx.txid,
                blockHeight: tx.block?.height,
                value: tx.outputs.reduce((sum, output) => sum + output.value, 0),
                confirmedTime: new Date(tx.time * 1000).toISOString(),
                spent: tx.outputs.some((output) => output.spent),
                confirmations: tx.block ? -tx.block.height : 0,
                inputs: tx.inputs,
                outputs: tx.outputs.map((output) => ({
                    address: output.address,
                    value: output.value,
                    spent: output.spent,
                    spender: output.spender ? output.spender.txid : null,
                })),
            }));
        case 'blockcypher':
        default:
            // Existing BlockCypher mapping
            if (!Array.isArray(data.txrefs)) {
                return [];
            }
            return data.txrefs.map((tx) => ({
                hash: tx.tx_hash,
                blockHeight: tx.block_height,
                value: tx.value,
                confirmedTime: tx.confirmed,
                spent: tx.spent,
                confirmations: tx.confirmations,
            }));
    }
};
exports.fetchUTXOTransactions = fetchUTXOTransactions;
// Utility function to fetch the UTXO wallet balance
const fetchUTXOWalletBalance = async (chain, address) => {
    const url = constructApiUrl(chain, 'fetchBalance', address, '');
    const data = await fetchFromApi(url);
    const provider = getProvider(chain);
    let balance;
    switch (provider) {
        case 'haskoin':
            balance = Number(data.confirmed) + Number(data.unconfirmed);
            return parseFloat(balance) > 0 ? (0, blockchain_1.satoshiToStandardUnit)(balance, chain) : 0;
        case 'blockcypher':
        default:
            balance = Number(data.final_balance);
            return parseFloat(balance) > 0 ? (0, blockchain_1.satoshiToStandardUnit)(balance, chain) : 0;
    }
};
exports.fetchUTXOWalletBalance = fetchUTXOWalletBalance;
// Utility function to fetch the raw transaction hex
const fetchRawTransaction = async (txHash, chain) => {
    const provider = getProvider(chain);
    const apiURL = constructApiUrl(chain, 'fetchRawTransaction', '', txHash);
    try {
        const data = await fetchFromApi(apiURL, { timeout: HTTP_TIMEOUT });
        switch (provider) {
            case 'haskoin':
                if (!data.result) {
                    throw new Error('Missing hex data in response');
                }
                return data.result;
            case 'blockcypher':
            default:
                if (!data.hex) {
                    throw new Error('Missing hex data in response');
                }
                return data.hex;
        }
    }
    catch (error) {
        logger.error(`Error fetching raw transaction hex for ${chain}: ${error.message}`);
        throw error;
    }
};
exports.fetchRawTransaction = fetchRawTransaction;
const fetchTransaction = async (txHash, chain) => {
    const provider = getProvider(chain);
    const apiURL = constructApiUrl(chain, 'fetchTransaction', '', txHash);
    const maxRetries = 10; // Maximum number of retries
    const retryDelay = 30000; // 30 seconds delay between retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const data = await fetchFromApi(apiURL, { timeout: HTTP_TIMEOUT });
            if (data.error && provider === 'haskoin') {
                if (data.error === 'not-found-or-invalid-arg' && attempt < maxRetries) {
                    console.log(`Attempt ${attempt}: Transaction not found, retrying in ${retryDelay / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    continue; // Retry
                }
                throw new Error(data.message); // Throw error for other cases
            }
            return formatTransactionData(data, provider);
        }
        catch (error) {
            logger.error(`Error fetching transaction for ${chain}: ${error.message}`);
            if (attempt === maxRetries)
                throw error; // Throw error after final attempt
        }
    }
};
exports.fetchTransaction = fetchTransaction;
function formatTransactionData(data, provider) {
    switch (provider) {
        case 'haskoin':
            return {
                hash: data.txid,
                block_height: data.block?.height,
                inputs: data.inputs,
                outputs: data.outputs.map((output) => ({
                    addresses: [output.address],
                    script: output.pkscript,
                    value: output.value,
                    spent: output.spent,
                    spender: output.spender,
                })),
            };
        case 'blockcypher':
        default:
            return {
                hash: data.hash,
                block_height: data.block_height,
                inputs: data.inputs,
                outputs: data.outputs.map((output) => ({
                    addresses: output.addresses,
                    script: output.script,
                    value: output.value,
                    spender: output.spent_by,
                })),
            };
    }
}
// Utility function to verify a UTXO transaction
const verifyUTXOTransaction = async (chain, txHash) => {
    const url = constructApiUrl(chain, 'fetchTransaction', '', txHash);
    const startTime = Date.now();
    const maxDuration = 1800 * 1000; // 30 minutes in milliseconds
    const retryInterval = 30 * 1000; // 30 seconds in milliseconds
    const provider = getProvider(chain);
    while (Date.now() - startTime < maxDuration) {
        try {
            const txData = await fetchFromApi(url);
            let confirmed = false;
            let fees = 0;
            switch (provider) {
                case 'haskoin':
                    confirmed = !!txData.block;
                    fees = txData.fee;
                    break;
                case 'blockcypher':
                default:
                    confirmed = txData.confirmations >= 1;
                    fees = txData.fees ? (0, blockchain_1.satoshiToStandardUnit)(txData.fees, chain) : 0;
                    break;
            }
            if (confirmed) {
                return { confirmed, fees };
            }
        }
        catch (error) {
            logger.error(`Error verifying UTXO transaction: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
    return { confirmed: false, fees: 0 };
};
exports.verifyUTXOTransaction = verifyUTXOTransaction;
// Utility function to broadcast a raw transaction hex
const broadcastRawTransaction = async (rawTxHex, chain) => {
    if (!rawTxHex) {
        logger.error('Error broadcasting transaction: No transaction data provided');
        return { success: false, error: 'No transaction data provided', txid: null };
    }
    try {
        // Construct the API URL for broadcasting
        const apiUrl = constructApiUrl(chain, 'broadcastTransaction', '', '', 'blockcypher');
        // Perform the API request
        const response = await (0, node_fetch_1.default)(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx: rawTxHex }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Transaction broadcast failed');
        }
        if (!data.tx) {
            throw new Error('Transaction broadcast failed: No transaction ID returned');
        }
        // Return success with the transaction hash
        return { success: true, txid: data.tx.hash };
    }
    catch (error) {
        logger.error(`Error broadcasting transaction for ${chain}: ${error.message}`);
        return { success: false, error: error.message, txid: null };
    }
};
exports.broadcastRawTransaction = broadcastRawTransaction;
// Utility function to calculate the transaction fee
const calculateUTXOFee = async (toAddress, amount, chain) => {
    // Fetch the current fee rate per byte for the specific chain
    const feeRatePerByte = await getCurrentFeeRatePerByte(chain);
    if (!feeRatePerByte) {
        throw new Error('Failed to fetch current fee rate');
    }
    const inputs = [];
    const outputs = [];
    let totalInputValue = 0;
    const utxos = await prisma_1.default.ecosystem_utxo.findMany({
        where: { status: false },
        orderBy: { amount: 'desc' }, // Optional: Order by amount for efficient selection
    });
    if (utxos.length === 0)
        throw new Error('No UTXOs available for withdrawal');
    // Select UTXOs
    for (const utxo of utxos) {
        inputs.push(utxo);
        totalInputValue += utxo.amount;
        if (totalInputValue >= amount) {
            break;
        }
    }
    // Create output for recipient
    outputs.push({ toAddress, amount });
    // Estimate transaction fee
    const estimatedTxSize = inputs.length * 180 + 2 * 34 + 10;
    const transactionFee = estimatedTxSize * feeRatePerByte;
    return transactionFee;
};
exports.calculateUTXOFee = calculateUTXOFee;
// Utility function to get the current fee rate per byte
async function getCurrentFeeRatePerByte(chain) {
    let url;
    switch (chain) {
        case 'BTC':
            url = 'https://mempool.space/api/v1/fees/recommended';
            try {
                const response = await (0, node_fetch_1.default)(url);
                if (!response.ok) {
                    throw new Error(`Error fetching fee rate for ${chain}: ${response.statusText}`);
                }
                const data = await response.json();
                // Use the "half hour fee" for a good balance between speed and cost
                const feeRatePerByte = data.halfHourFee;
                return feeRatePerByte;
            }
            catch (error) {
                console.error(`Failed to fetch current fee rate for ${chain}: ${error.message}`);
                return null;
            }
        case 'LTC':
            url = `${BLOCKCYPHER_API_URL}/ltc/main`;
            break;
        case 'DOGE':
            url = `${BLOCKCYPHER_API_URL}/doge/main`;
            break;
        default:
            throw new Error(`Unsupported UTXO chain: ${chain}`);
    }
    try {
        const response = await (0, node_fetch_1.default)(url, { timeout: HTTP_TIMEOUT });
        if (!response.ok) {
            throw new Error(`Error fetching fee rate for ${chain}: ${response.statusText}`);
        }
        const data = await response.json();
        // Fee per kilobyte
        const mediumFeePerKb = data.medium_fee_per_kb || data.medium_fee_per_kbyte;
        // Convert to fee per byte
        const feeRatePerByte = mediumFeePerKb / 1024;
        return feeRatePerByte;
    }
    catch (error) {
        console.error(`Failed to fetch current fee rate for ${chain}: ${error.message}`);
        return null;
    }
}
exports.getCurrentFeeRatePerByte = getCurrentFeeRatePerByte;
// Utility function to withdraw UTXO
async function handleUTXOWithdrawal(transaction) {
    const chain = transaction.metadata.chain;
    const toAddress = transaction.metadata.toAddress;
    const amountToSend = (0, blockchain_1.standardUnitToSatoshi)(transaction.amount, chain);
    const flatFee = (0, blockchain_1.standardUnitToSatoshi)(transaction.fee, chain);
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { id: transaction.wallet_id },
    });
    if (!wallet)
        throw new Error('Wallet not found');
    const masterWallet = (await (0, queries_1.getMasterWalletByChain)(chain));
    if (!masterWallet)
        throw new Error(`Master wallet not found for ${chain}`);
    // Get all available UTXOs regardless of the wallet
    const utxos = await prisma_1.default.ecosystem_utxo.findMany({
        where: { status: false },
        orderBy: { amount: 'desc' }, // Optional: Order by amount for efficient selection
    });
    if (utxos.length === 0)
        throw new Error('No UTXOs available for withdrawal');
    const network = getNetwork(chain);
    if (!network)
        throw new Error(`Unsupported UTXO chain: ${chain}`);
    const psbt = new bitcoin.Psbt({ network });
    let totalInputValue = 0;
    const keyPairs = [];
    // Calculate total transaction fee
    let transactionFee;
    if (chain === 'BTC') {
        transactionFee = 380;
    }
    else {
        // Fetch the current fee rate per byte for the specific chain
        const currentFeeRatePerByte = await getCurrentFeeRatePerByte(chain);
        if (!currentFeeRatePerByte) {
            throw new Error('Failed to fetch current fee rate');
        }
        // Estimate transaction size
        const estimatedTxSize = keyPairs.length * 180 + 2 * 34 + 10; // Rough estimation
        transactionFee = estimatedTxSize * currentFeeRatePerByte;
    }
    // Adjust requiredAmount to include transaction fee
    const requiredAmount = amountToSend + flatFee + transactionFee;
    for (const utxo of utxos) {
        if (totalInputValue >= requiredAmount)
            break; // Stop if we have enough to cover the transaction and fee
        // Get wallet data for each UTXO
        const walletData = (await prisma_1.default.wallet_data.findFirst({
            where: { wallet_id: utxo.wallet_id },
        }));
        if (!walletData)
            continue; // Skip if no wallet data found
        const decryptedData = JSON.parse((0, encrypt_1.decrypt)(walletData.data));
        if (!decryptedData.privateKey)
            continue; // Skip if no private key found
        const rawTxHex = await (0, exports.fetchRawTransaction)(utxo.transaction_id, chain);
        psbt.addInput({
            hash: utxo.transaction_id,
            index: utxo.index,
            nonWitnessUtxo: Buffer.from(rawTxHex, 'hex'),
        });
        totalInputValue += utxo.amount;
        // Store the keyPair for signing later
        const keyPair = ECPair.fromWIF(decryptedData.privateKey, network);
        keyPairs.push({ index: psbt.inputCount - 1, keyPair });
    }
    // Check if totalInputValue is sufficient to cover the amount and the fee
    if (totalInputValue < requiredAmount) {
        throw new Error('Insufficient funds to cover the amount and transaction fee');
    }
    // Add outputs
    psbt.addOutput({
        address: toAddress,
        value: amountToSend,
    });
    psbt.addOutput({
        address: masterWallet.address,
        value: flatFee,
    });
    const changeAddress = wallet.addresses[chain].address;
    const change = totalInputValue - requiredAmount;
    if (change > 0) {
        psbt.addOutput({
            address: changeAddress,
            value: change,
        });
    }
    // Sign inputs
    keyPairs.forEach(({ index, keyPair }) => {
        psbt.signInput(index, keyPair);
    });
    psbt.finalizeAllInputs();
    // Broadcast transaction
    const rawTx = psbt.extractTransaction().toHex();
    const broadcastResult = await (0, exports.broadcastRawTransaction)(rawTx, chain);
    if (!broadcastResult.success)
        throw new Error('Failed to broadcast transaction');
    const txid = broadcastResult.txid;
    // Fetch the broadcasted transaction data to get index of change output
    if (change > 0) {
        const changeTxData = await (0, exports.fetchTransaction)(txid, chain);
        // Find the output that corresponds to the change address
        const changeOutput = changeTxData.outputs.find((output) => output.addresses && output.addresses.includes(changeAddress));
        // Ensure changeOutput is defined before accessing its properties
        if (changeOutput) {
            const changeOutputIndex = changeTxData.outputs.indexOf(changeOutput);
            const changeScript = changeOutput.script;
            // Record new UTXO for change in the database
            await prisma_1.default.ecosystem_utxo.create({
                data: {
                    wallet_id: wallet.id,
                    transaction_id: txid,
                    index: changeOutputIndex,
                    amount: change,
                    script: changeScript,
                    status: false,
                },
            });
        }
        else {
            // Handle the case where change output is not found
            logger.error('Change output not found in transaction data');
            // Consider how you want to handle this situation
        }
    }
    // Mark UTXOs as spent
    for (const utxo of utxos) {
        await prisma_1.default.ecosystem_utxo.update({
            where: { id: utxo.id },
            data: { status: true },
        });
    }
    await prisma_1.default.transaction.update({
        where: { uuid: transaction.uuid },
        data: {
            status: 'COMPLETED',
            description: `Withdrawal of ${transaction.amount} ${wallet.currency} to ${toAddress}`,
            reference_id: txid,
        },
    });
    return { success: true, txid: txid };
}
exports.handleUTXOWithdrawal = handleUTXOWithdrawal;
