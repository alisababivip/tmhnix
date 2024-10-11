"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCustodialContract = exports.getCustodialWalletContract = exports.getCustodialWalletNativeBalance = exports.getCustodialWalletTokenBalance = exports.getCustodialWalletBalances = exports.controllers = void 0;
// adminWalletController.ts
const ethers_1 = require("ethers");
const logger_1 = require("~~/logger");
const utils_1 = require("~~/utils");
const encrypt_1 = require("~~/utils/encrypt");
const queries_1 = require("../../admin/tokens/queries");
const utils_2 = require("../../utils");
const gas_1 = require("../../utils/gas");
const queries_2 = require("../wallets/queries");
const queries_3 = require("./queries");
const logger = (0, logger_1.createLogger)('Ecosystem Custodial Wallets');
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('Unauthorized');
        const { chain } = params;
        return await (0, queries_3.getCustodialWallets)(chain);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const custodialWallet = (await (0, queries_3.getCustodialWallet)(uuid));
        if (!custodialWallet) {
            throw new Error(`Custodial wallet not found for uuid: ${uuid}`);
        }
        const provider = (0, utils_2.getProvider)(custodialWallet.chain);
        if (!provider) {
            throw new Error('Provider not initialized');
        }
        const contract = await getCustodialWalletContract(custodialWallet.address, provider);
        const chainCurrency = utils_2.chainConfigs[custodialWallet.chain].currency;
        const tokens = await (0, queries_1.getNoPermitTokens)(custodialWallet.chain);
        const { balances, native } = await getCustodialWalletBalances(contract, tokens);
        // Append the tokenBalances to the custodialWallet object
        custodialWallet.balances = balances;
        custodialWallet.nativeBalance = native;
        custodialWallet.nativeCurrency = chainCurrency;
        return custodialWallet;
    }),
    deploy: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { chain } = query;
            const wallet = await (0, queries_2.getMasterWalletByChainFull)(chain);
            if (!wallet) {
                throw new Error(`Master wallet not found for chain: ${chain}`);
            }
            const walletContractAddress = await deployCustodialContract(wallet);
            if (!walletContractAddress) {
                throw new Error('Failed to deploy custodial wallet contract');
            }
            const custodialWallet = await (0, queries_3.storeCustodialWallet)(wallet.id, wallet.chain, walletContractAddress);
            return custodialWallet;
        }
        catch (error) {
            if ((0, ethers_1.isError)(error, 'INSUFFICIENT_FUNDS')) {
                // Handle insufficient funds
                logger.error('Insufficient funds for transaction');
            }
            // General error logging
            logger.error(`Failed to deploy custodial wallet contract: ${error.message}`);
            throw new Error(error.message);
        }
    }),
};
async function getCustodialWalletBalances(contract, tokens, format = true) {
    const tokensAddresses = tokens.map((token) => token.contract);
    const [nativeBalance, tokenBalances] = await contract.getAllBalances(tokensAddresses);
    const balances = tokenBalances.map((balance, index) => ({
        ...tokens[index],
        balance: format
            ? ethers_1.ethers.formatUnits(balance, tokens[index].decimals)
            : balance,
    }));
    const native = format ? ethers_1.ethers.formatEther(nativeBalance) : nativeBalance;
    return { balances, native };
}
exports.getCustodialWalletBalances = getCustodialWalletBalances;
async function getCustodialWalletTokenBalance(contract, tokenContractAddress) {
    return await contract.getTokenBalance(tokenContractAddress);
}
exports.getCustodialWalletTokenBalance = getCustodialWalletTokenBalance;
async function getCustodialWalletNativeBalance(contract) {
    return await contract.getNativeBalance();
}
exports.getCustodialWalletNativeBalance = getCustodialWalletNativeBalance;
async function getCustodialWalletContract(address, provider) {
    const { abi } = await (0, utils_2.getSmartContract)('wallet', 'CustodialWalletERC20');
    if (!abi) {
        throw new Error('Smart contract ABI or Bytecode not found');
    }
    return new ethers_1.ethers.Contract(address, abi, provider);
}
exports.getCustodialWalletContract = getCustodialWalletContract;
async function deployCustodialContract(masterWallet) {
    try {
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
        if ((0, ethers_1.isError)(error, 'INSUFFICIENT_FUNDS')) {
            // Specific handling for not enough funds
            throw new Error('Not enough funds to deploy the contract');
        }
        throw new Error(error.message);
    }
}
exports.deployCustodialContract = deployCustodialContract;
