"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractAbi = exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
const ethers_1 = require("ethers");
const encrypt_1 = require("~~/utils/encrypt");
const utils_2 = require("../../utils");
const gas_1 = require("../../utils/gas");
const tokens_1 = require("../../utils/tokens");
const queries_2 = require("../wallets/queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { filter, perPage, page } = query;
        const perPageNumber = perPage ? parseInt(perPage, 10) : 10;
        const pageNumber = page ? parseInt(page, 10) : 1;
        return await (0, queries_1.getAllEcosystemTokens)(filter, perPageNumber, pageNumber);
    }),
    list: (0, utils_1.handleController)(async () => {
        return await (0, queries_1.getEcosystemTokensAll)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { chain, currency } = params;
        return await (0, queries_1.getEcosystemTokenById)(chain, currency);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { chain, name, currency, initialSupply, initialHolder, decimals, cap, } = body;
        // Get the master wallet for this chain
        const masterWallet = await (0, queries_2.getMasterWalletByChainFull)(chain);
        if (!masterWallet) {
            throw new Error(`Master wallet for chain ${chain} not found`);
        }
        // Deploy the token contract
        const contract = await deployTokenContract(masterWallet, chain, name, currency, initialHolder, decimals, initialSupply, cap);
        const type = utils_2.chainConfigs[chain]?.smartContract?.name;
        if (!type) {
            throw new Error(`Smart contract type not found for chain ${chain}`);
        }
        const network = process.env[`${chain}_NETWORK`];
        if (!network) {
            throw new Error(`Network not found for chain ${chain}`);
        }
        return await (0, queries_1.createEcosystemToken)(chain, name, currency, contract, decimals, type, network);
    }),
    import: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { name, currency, chain, network, type, contract, decimals, contractType, } = body;
        return await (0, queries_1.importEcosystemToken)(name, currency, chain, network, type, contract, decimals, contractType);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { precision, limits, fees } = body;
        return await (0, queries_1.updateAdminToken)(id, precision, limits, fees);
    }),
    updateIcon: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { icon } = body;
        return await (0, queries_1.updateAdminTokenIcon)(id, icon);
    }),
    holders: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        try {
            const { chain, currency } = params;
            const token = await (0, queries_1.getEcosystemTokenById)(chain, currency);
            if (!token) {
                throw new Error(`Token not found for chain ${chain} and currency ${currency}`);
            }
            const holders = await (0, tokens_1.fetchTokenHolders)(chain, token.network, token.contract);
            return {
                token,
                holders,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch token holders: ${error.message}`);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { ids, status } = body;
            await (0, queries_1.updateStatusBulk)(ids, status);
            return {
                message: 'Currencies updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
async function deployTokenContract(masterWallet, chain, name, symbol, receiver, decimals, initialBalance, cap) {
    try {
        // Initialize Ethereum provider
        const provider = (0, utils_2.getProvider)(chain);
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        // Decrypt mnemonic
        const decryptedData = JSON.parse((0, encrypt_1.decrypt)(masterWallet.data));
        if (!decryptedData || !decryptedData.privateKey) {
            throw new Error('Decrypted data or Mnemonic not found');
        }
        const { privateKey } = decryptedData;
        // Create a signer
        const signer = new ethers_1.ethers.Wallet(privateKey).connect(provider);
        // Get contract ABI and Bytecode
        const smartContractFile = utils_2.chainConfigs[chain]?.smartContract?.file;
        if (!smartContractFile) {
            throw new Error(`Smart contract file not found for chain ${chain}`);
        }
        const { abi, bytecode } = await (0, utils_2.getSmartContract)('token', smartContractFile);
        if (!abi || !bytecode) {
            throw new Error('Smart contract ABI or Bytecode not found');
        }
        // Create Contract Factory
        const tokenFactory = new ethers_1.ContractFactory(abi, bytecode, signer);
        if (initialBalance === undefined || cap === undefined) {
            throw new Error('Initial balance or Cap is undefined');
        }
        // Convert initialBalance to its smallest unit based on the number of decimals
        const adjustedInitialBalance = ethers_1.ethers.parseUnits(initialBalance.toString(), decimals);
        const adjustedCap = ethers_1.ethers.parseUnits(cap.toString(), decimals);
        // Fetch adjusted gas price
        const gasPrice = await (0, gas_1.getAdjustedGasPrice)(provider);
        // Deploy the contract with dynamic gas settings
        const tokenContract = await tokenFactory.deploy(name, symbol, receiver, decimals, adjustedCap, adjustedInitialBalance, {
            gasPrice: gasPrice,
        });
        // Wait for the contract to be deployed
        const response = await tokenContract.waitForDeployment();
        return await response.getAddress();
    }
    catch (error) {
        // if (error.code === 'CALL_EXCEPTION') {
        //   throw new Error('Token already exists')
        // }
        throw new Error(error.message);
    }
}
const getContractAbi = async (chain, network, contractAddress) => {
    const chainConfig = utils_2.chainConfigs[chain];
    if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`);
    }
    const apiKey = process.env[`${chain}_EXPLORER_API_KEY`];
    if (!apiKey) {
        throw new Error(`API Key for ${chain} is not set`);
    }
    const networkConfig = chainConfig.networks[network];
    if (!networkConfig || !networkConfig.explorer) {
        throw new Error(`Unsupported network: ${network} for chain: ${chain}`);
    }
    const apiUrl = `https://${networkConfig.explorer}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`;
    let data;
    try {
        const response = await fetch(apiUrl);
        data = await response.json();
    }
    catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
    if (data.status !== '1') {
        throw new Error(`API Error: ${data.message}`);
    }
    return data.result;
};
exports.getContractAbi = getContractAbi;
