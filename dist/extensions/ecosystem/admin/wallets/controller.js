"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndEncryptWallet = exports.controllers = void 0;
// adminWalletController.ts
const date_fns_1 = require("date-fns");
const ethers_1 = require("ethers");
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("~~/logger");
const utils_1 = require("~~/utils");
const encrypt_1 = require("~~/utils/encrypt");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("../../admin/tokens/queries");
const utils_2 = require("../../utils");
const gas_1 = require("../../utils/gas");
const transactions_1 = require("../../utils/transactions");
const utxo_1 = require("../../utils/utxo");
const queries_2 = require("../custodial/queries");
const queries_3 = require("./queries");
const logger = (0, logger_1.createLogger)('Ecosystem Master Wallets');
const FIVE_MINUTES = 5;
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('Unauthorized');
        return await (0, queries_3.getAllMasterWallets)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
            return await (0, queries_3.getMasterWalletById)(params.uuid);
        }
        catch (error) {
            throw new Error(`Failed to fetch master wallet: ${error.message}`);
        }
    }),
    showChain: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
            return await (0, queries_3.getMasterWalletByChain)(params.chain);
        }
        catch (error) {
            throw new Error(`Failed to fetch master wallet: ${error.message}`);
        }
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
            const { chain } = body;
            const existingWallet = await (0, queries_3.getMasterWalletByChain)(chain);
            if (existingWallet) {
                throw new Error(`Master wallet already exists: ${chain}`);
            }
            const walletData = await (0, exports.createAndEncryptWallet)(chain);
            return await (0, queries_3.createMasterWallet)(walletData, utils_2.chainConfigs[chain].currency);
        }
        catch (error) {
            throw new Error(`Failed to create master wallet: ${error.message}`);
        }
    }),
    balance: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('Unauthorized');
        try {
            const wallets = await (0, queries_3.getAllMasterWallets)();
            await Promise.all(wallets.map(getWalletBalance));
            return wallets;
        }
        catch (error) {
            throw new Error(`Failed to fetch master wallets: ${error.message}`);
        }
    }),
    transactions: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const { chain, address } = params;
            return await (0, transactions_1.fetchTransactions)(chain, address);
        }
        catch (error) {
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }),
    internalTransactions: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        try {
            const { chain, address } = params;
            return await (0, transactions_1.fetchTransactions)(chain, address);
        }
        catch (error) {
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }),
    tokens: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user)
            throw new Error('Unauthorized');
        try {
            const { uuid } = params;
            const wallet = await (0, queries_3.getMasterWalletById)(uuid);
            if (!wallet) {
                throw new Error(`Master wallet not found: ${uuid}`);
            }
            const tokens = await (0, queries_1.getEcosystemTokensByChain)(wallet.chain);
            return tokens;
        }
        catch (error) {
            throw new Error(`Failed to fetch tokens: ${error.message}`);
        }
    }),
    deployCustodial: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { chain } = query;
            const wallet = await (0, queries_3.getMasterWalletByChainFull)(chain);
            if (!wallet) {
                throw new Error(`Master wallet not found for chain: ${chain}`);
            }
            const walletContractAddress = await deployCustodialContract(wallet);
            if (!walletContractAddress) {
                throw new Error('Failed to deploy custodial wallet contract');
            }
            const custodialWallet = await (0, queries_2.storeCustodialWallet)(wallet.id, wallet.chain, walletContractAddress);
            return custodialWallet;
        }
        catch (error) {
            throw new Error(`Failed to deploy custodial wallet contract: ${error}`);
        }
    }),
};
const createAndEncryptWallet = async (chain) => {
    let wallet;
    // Check if the chain is an EVM chain or a UTXO chain
    if (['BTC', 'LTC', 'DOGE'].includes(chain)) {
        // Generate a UTXO wallet
        wallet = (0, utxo_1.createUTXOWallet)(chain);
    }
    else {
        // Generate an EVM wallet
        wallet = createEVMWallet();
    }
    // Define the directory and file path
    const walletDir = `${process.cwd()}/ecosystem/wallets`;
    const walletFilePath = `${walletDir}/${chain}.json`;
    // Check if directory exists, if not create it
    if (!fs_1.default.existsSync(walletDir)) {
        fs_1.default.mkdirSync(walletDir, { recursive: true });
    }
    await fs_1.default.writeFileSync(walletFilePath, JSON.stringify(wallet), 'utf8');
    // Encrypt all the wallet details
    const data = (0, encrypt_1.encrypt)(JSON.stringify(wallet.data));
    return {
        address: wallet.address,
        chain,
        data,
    };
};
exports.createAndEncryptWallet = createAndEncryptWallet;
const createEVMWallet = () => {
    // Generate a random wallet
    const wallet = ethers_1.ethers.Wallet.createRandom();
    // Derive the HDNode from the wallet's mnemonic
    const hdNode = ethers_1.ethers.HDNodeWallet.fromPhrase(wallet.mnemonic.phrase);
    const xprv = hdNode.extendedKey;
    const xpub = hdNode.neuter().extendedKey;
    const mnemonic = hdNode.mnemonic.phrase;
    const address = hdNode.address;
    const publicKey = hdNode.publicKey;
    const privateKey = hdNode.privateKey;
    const path = hdNode.path;
    const chainCode = hdNode.chainCode;
    return {
        address,
        data: {
            mnemonic,
            publicKey,
            privateKey,
            xprv,
            xpub,
            chainCode,
            path,
        },
    };
};
const getWalletBalance = async (wallet) => {
    try {
        const cacheKey = `wallet:${wallet.uuid}:balance`;
        let cachedBalanceData = await redis_1.redis.get(cacheKey);
        if (cachedBalanceData) {
            if (typeof cachedBalanceData !== 'object') {
                cachedBalanceData = JSON.parse(cachedBalanceData);
            }
            const now = new Date();
            const lastUpdated = new Date(cachedBalanceData.timestamp);
            if ((0, date_fns_1.differenceInMinutes)(now, lastUpdated) < 5 &&
                parseFloat(cachedBalanceData.balance) !== 0) {
                return;
            }
        }
        let formattedBalance;
        if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(wallet.chain)) {
            formattedBalance = await (0, utxo_1.fetchUTXOWalletBalance)(wallet.chain, wallet.address);
        }
        else {
            const provider = (0, utils_2.getProvider)(wallet.chain);
            const balance = await provider.getBalance(wallet.address);
            const decimals = utils_2.chainConfigs[wallet.chain].decimals;
            formattedBalance = ethers_1.ethers.formatUnits(balance.toString(), decimals);
        }
        if (!formattedBalance || isNaN(parseFloat(formattedBalance))) {
            logger.error(`Invalid formatted balance for ${wallet.chain} wallet: ${formattedBalance}`);
            return;
        }
        if (parseFloat(formattedBalance) === 0) {
            return;
        }
        await (0, queries_3.updateMasterWalletBalance)(wallet.uuid, parseFloat(formattedBalance));
        const cacheData = {
            balance: formattedBalance,
            timestamp: new Date().toISOString(),
        };
        await redis_1.redis.setex(cacheKey, 300, JSON.stringify(cacheData));
    }
    catch (error) {
        logger.error(`Failed to fetch ${wallet.chain} wallet balance: ${error.message}`);
    }
};
async function deployCustodialContract(masterWallet) {
    try {
        // Initialize Ethereum provider
        const provider = (0, utils_2.getProvider)(masterWallet.chain);
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        // Decrypt mnemonic
        let decryptedData;
        try {
            decryptedData = JSON.parse((0, encrypt_1.decrypt)(masterWallet.data));
        }
        catch (error) {
            throw new Error(`Failed to decrypt mnemonic: ${error.message}`);
        }
        if (!decryptedData || !decryptedData.privateKey) {
            throw new Error('Decrypted data or Mnemonic not found');
        }
        const { privateKey } = decryptedData;
        // Create a signer
        const signer = new ethers_1.ethers.Wallet(privateKey).connect(provider);
        const { abi, bytecode } = await (0, utils_2.getSmartContract)('wallet', 'CustodialWalletERC20');
        if (!abi || !bytecode) {
            throw new Error('Smart contract ABI or Bytecode not found');
        }
        // Create Contract Factory
        const custodialWalletFactory = new ethers_1.ContractFactory(abi, bytecode, signer);
        // Fetch adjusted gas price
        const gasPrice = await (0, gas_1.getAdjustedGasPrice)(provider);
        // Deploy the contract with dynamic gas settings
        const custodialWalletContract = await custodialWalletFactory.deploy(masterWallet.address, {
            gasPrice: gasPrice,
        });
        // Wait for the contract to be deployed
        const response = await custodialWalletContract.waitForDeployment();
        return await response.getAddress();
    }
    catch (error) {
        throw new Error(error.message);
    }
}
