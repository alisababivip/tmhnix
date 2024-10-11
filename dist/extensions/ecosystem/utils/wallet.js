"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndValidateNativeTokenOwner = exports.executeNativeWithdrawal = exports.executePermit = exports.getAndValidateTokenOwner = exports.executeNoPermitWithdrawal = exports.executeWithdrawal = exports.initializeContracts = exports.getTokenOwner = exports.validateBalances = exports.validateAddress = exports.getGasPayer = exports.checkAvailableFunds = void 0;
const ethers_1 = require("ethers");
const _1 = require(".");
const logger_1 = require("../../../logger");
const encrypt_1 = require("../../../utils/encrypt");
const prisma_1 = __importDefault(require("../../../utils/prisma"));
const controller_1 = require("../admin/custodial/controller");
const queries_1 = require("../admin/custodial/queries");
const queries_2 = require("../admin/wallets/queries");
const queries_3 = require("../user/wallets/queries");
const blockchain_1 = require("./blockchain");
const gas_1 = require("./gas");
const tokens_1 = require("./tokens");
const logger = (0, logger_1.createLogger)('Ecosystem Wallets');
// Check if there are enough funds for the withdrawal
async function checkAvailableFunds(userWallet, walletData, totalAmount) {
    try {
        const totalAvailable = await getTotalAvailable(userWallet, walletData);
        if (totalAvailable < totalAmount)
            throw new Error('Insufficient funds for withdrawal including fees');
        return totalAvailable;
    }
    catch (error) {
        logger.error(`Failed to check available funds: ${error.message}`);
        throw new Error('Withdrawal failed - please try again later');
    }
}
exports.checkAvailableFunds = checkAvailableFunds;
// Get total available balance
const getTotalAvailable = async (userWallet, walletData) => {
    const pvEntry = await prisma_1.default.ecosystem_private_ledger.findFirst({
        where: {
            wallet_id: userWallet.id,
            index: walletData.index,
            currency: userWallet.currency,
            chain: walletData.chain,
        },
    });
    return userWallet.balance + (pvEntry ? pvEntry.offchain_difference : 0);
};
async function getGasPayer(chain, provider) {
    // Decrypt the master wallet data to get the private key
    const masterWallet = await (0, queries_2.getMasterWalletByChainFull)(chain);
    if (!masterWallet) {
        logger.error(`Master wallet for chain ${chain} not found`);
        throw new Error('Withdrawal failed - please try again later');
    }
    const { data } = masterWallet;
    if (!data) {
        logger.error('Master wallet data not found');
        throw new Error('Withdrawal failed - please try again later');
    }
    const decryptedMasterData = JSON.parse((0, encrypt_1.decrypt)(data));
    if (!decryptedMasterData.privateKey) {
        logger.error('Decryption failed - mnemonic not found');
        throw new Error('Withdrawal failed - please try again later');
    }
    // Initialize the admin wallet using the decrypted mnemonic
    try {
        return new ethers_1.ethers.Wallet(decryptedMasterData.privateKey, provider);
    }
    catch (error) {
        logger.error(`Failed to initialize admin wallet: ${error.message}`);
        throw new Error('Withdrawal failed - please try again later');
    }
}
exports.getGasPayer = getGasPayer;
// Validate Ethereum address
const validateAddress = (toAddress) => {
    if (!ethers_1.ethers.isAddress(toAddress)) {
        throw new Error(`Invalid target wallet address: ${toAddress}`);
    }
};
exports.validateAddress = validateAddress;
const validateBalances = async (tokenContract, actualTokenOwner, amount) => {
    const tokenOwnerBalance = (await tokenContract.balanceOf(actualTokenOwner.address)).toString();
    if (tokenOwnerBalance < amount) {
        throw new Error(`Insufficient funds in the wallet for withdrawal`);
    }
    return true;
};
exports.validateBalances = validateBalances;
// Get Token Owner
const getTokenOwner = (walletData, provider) => {
    const { data } = walletData;
    const decryptedData = JSON.parse((0, encrypt_1.decrypt)(data));
    if (!decryptedData.privateKey) {
        throw new Error(`Invalid private key`);
    }
    const { privateKey } = decryptedData;
    return new ethers_1.ethers.Wallet(privateKey, provider);
};
exports.getTokenOwner = getTokenOwner;
// Initialize Token Contracts
const initializeContracts = async (chain, currency, provider) => {
    const { contractAddress, contractType, tokenDecimals } = await (0, tokens_1.getTokenContractAddress)(chain, currency);
    const gasPayer = await getGasPayer(chain, provider);
    const { abi } = await (0, _1.getSmartContract)('token', 'ERC20');
    const contract = new ethers_1.ethers.Contract(contractAddress, abi, provider);
    return {
        contract,
        contractAddress,
        gasPayer,
        contractType,
        tokenDecimals,
    };
};
exports.initializeContracts = initializeContracts;
// Perform TransferFrom Transaction
const executeWithdrawal = async (tokenContract, tokenContractAddress, gasPayer, tokenOwner, toAddress, amount, provider) => {
    const gasPrice = await (0, gas_1.getAdjustedGasPrice)(provider);
    const transferFromTransaction = {
        to: tokenContractAddress,
        from: gasPayer.address,
        data: tokenContract.interface.encodeFunctionData('transferFrom', [
            tokenOwner.address,
            toAddress,
            amount,
        ]),
    };
    const gasLimitForTransferFrom = await (0, gas_1.estimateGas)(transferFromTransaction, provider);
    const trx = await tokenContract
        .connect(gasPayer)
        .getFunction('transferFrom')
        .send(tokenOwner.address, toAddress, amount, {
        gasPrice: gasPrice,
        gasLimit: gasLimitForTransferFrom,
    });
    await trx.wait(2);
    return trx;
};
exports.executeWithdrawal = executeWithdrawal;
// Perform TransferFrom Transaction
const executeNoPermitWithdrawal = async (chain, tokenContractAddress, gasPayer, toAddress, amount, provider, isNative) => {
    const custodialWallets = await (0, queries_1.getActiveCustodialWallets)(chain);
    if (!custodialWallets || custodialWallets.length === 0) {
        throw new Error('No custodial wallets found');
    }
    let tokenOwner, custodialContract, custodialContractAddress;
    for (const custodialWallet of custodialWallets) {
        const custodialWalletContract = await (0, controller_1.getCustodialWalletContract)(custodialWallet.address, provider);
        const balance = await (0, controller_1.getCustodialWalletTokenBalance)(custodialWalletContract, tokenContractAddress);
        if (BigInt(balance) >= amount) {
            tokenOwner = custodialWallet;
            custodialContract = custodialWalletContract;
            custodialContractAddress = custodialWallet.address;
            break;
        }
    }
    if (!tokenOwner) {
        logger.error(`No custodial wallets found for chain ${chain}`);
        throw new Error('No custodial wallets found');
    }
    let trx;
    if (isNative) {
        trx = await custodialContract
            .connect(gasPayer)
            .getFunction('transferNative')
            .send(toAddress, amount);
    }
    else {
        trx = await custodialContract
            .connect(gasPayer)
            .getFunction('transferTokens')
            .send(tokenContractAddress, toAddress, amount);
    }
    await trx.wait(2);
    return trx;
};
exports.executeNoPermitWithdrawal = executeNoPermitWithdrawal;
// Fetch and validate the actual token owner
async function getAndValidateTokenOwner(walletData, amountEth, tokenContract, provider) {
    let alternativeWalletUsed = false; // Initialize flag
    const tokenOwner = await (0, exports.getTokenOwner)(walletData, provider);
    let actualTokenOwner = tokenOwner;
    let alternativeWallet = null;
    // If on-chain balance is not sufficient, find an alternative wallet
    const onChainBalance = await tokenContract.balanceOf(tokenOwner.address);
    if (onChainBalance < amountEth) {
        const alternativeWalletData = await (0, queries_3.findAlternativeWallet)(walletData, (0, blockchain_1.fromBigInt)(amountEth));
        alternativeWallet = alternativeWalletData;
        actualTokenOwner = (0, exports.getTokenOwner)(alternativeWalletData, provider);
        alternativeWalletUsed = true; // Set flag to true
    }
    (0, exports.validateBalances)(tokenContract, actualTokenOwner, amountEth);
    return { actualTokenOwner, alternativeWalletUsed, alternativeWallet }; // Return the flag along with the actualTokenOwner
}
exports.getAndValidateTokenOwner = getAndValidateTokenOwner;
// Perform Permit Transaction
const executePermit = async (tokenContract, tokenContractAddress, gasPayer, tokenOwner, amount, provider) => {
    const nonce = await tokenContract.nonces(tokenOwner.address);
    const deadline = (0, _1.getTimestampInSeconds)() + 4200;
    const domain = {
        chainId: await (0, _1.getChainId)(provider),
        name: await tokenContract.name(),
        verifyingContract: tokenContractAddress,
        version: '1',
    };
    // set the Permit type parameters
    const types = {
        Permit: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
            {
                name: 'nonce',
                type: 'uint256',
            },
            {
                name: 'deadline',
                type: 'uint256',
            },
        ],
    };
    // set the Permit type values
    const values = {
        owner: tokenOwner.address,
        spender: gasPayer.address,
        value: amount,
        nonce: nonce,
        deadline: deadline,
    };
    const signature = await tokenOwner.signTypedData(domain, types, values);
    const sig = ethers_1.ethers.Signature.from(signature);
    const recovered = ethers_1.ethers.verifyTypedData(domain, types, values, sig);
    if (recovered !== tokenOwner.address) {
        throw new Error(`Invalid signature`);
    }
    const gasPrice = await (0, gas_1.getAdjustedGasPrice)(provider);
    const permitTransaction = {
        to: tokenContractAddress,
        from: tokenOwner.address,
        nonce: nonce,
        data: tokenContract.interface.encodeFunctionData('permit', [
            tokenOwner.address,
            gasPayer.address,
            amount,
            deadline,
            sig.v,
            sig.r,
            sig.s,
        ]),
    };
    const gasLimitForPermit = await (0, gas_1.estimateGas)(permitTransaction, provider);
    const gasPayerBalance = (await tokenContract.balanceOf(gasPayer.address)).toString();
    if (BigInt(gasPayerBalance) <
        BigInt(gasLimitForPermit) * gasPrice * BigInt(2)) {
        // TODO: Add a notification to the admin about how much missing gas he needs to add to the wallet
        throw new Error(`Withdrawal failed, Please contact support team.`);
    }
    const tx = await tokenContract
        .connect(gasPayer)
        .getFunction('permit')
        .send(tokenOwner.address, gasPayer.address, amount, deadline, sig.v, sig.r, sig.s, {
        gasPrice: gasPrice,
        gasLimit: gasLimitForPermit,
    });
    await tx.wait(2);
    return tx;
};
exports.executePermit = executePermit;
const executeNativeWithdrawal = async (payer, toAddress, amount, provider) => {
    // Check gasPayer balance
    const balance = await provider.getBalance(payer.address);
    if (balance < amount) {
        throw new Error(`Insufficient funds for withdrawal`);
    }
    // Create transaction object
    const tx = {
        to: toAddress,
        value: amount,
    };
    // Send transaction
    const response = await payer.sendTransaction(tx);
    await response.wait(2);
    return response;
};
exports.executeNativeWithdrawal = executeNativeWithdrawal;
// Fetch and validate the actual token owner
async function getAndValidateNativeTokenOwner(walletData, amountEth, provider) {
    const tokenOwner = await (0, exports.getTokenOwner)(walletData, provider);
    // If on-chain balance is not sufficient, find an alternative wallet
    const onChainBalance = await provider.getBalance(tokenOwner.address);
    if (onChainBalance < amountEth) {
        throw new Error(`Insufficient funds in the wallet for withdrawal`);
    }
    return tokenOwner;
}
exports.getAndValidateNativeTokenOwner = getAndValidateNativeTokenOwner;
