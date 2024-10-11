"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChainEnvVariables = exports.controllers = void 0;
// adminWalletController.ts
const logger_1 = require("~~/logger");
const utils_1 = require("~~/utils");
const encrypt_1 = require("~~/utils/encrypt");
const queries_1 = require("./queries");
const logger = (0, logger_1.createLogger)('Ecosystem Blockchains');
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
            const totalMasterWallets = await (0, queries_1.getTotalMasterWallets)();
            const activeMasterWallets = await (0, queries_1.getActiveMasterWallets)();
            const totalCustodialWallets = await (0, queries_1.getTotalCustodialWallets)();
            const activeCustodialWallets = await (0, queries_1.getActiveCustodialWallets)();
            const totalTokens = await (0, queries_1.getTotalTokens)();
            const activeTokens = await (0, queries_1.getActiveTokens)();
            const totalMarkets = await (0, queries_1.getTotalMarkets)();
            const activeMarkets = await (0, queries_1.getActiveMarkets)();
            const chains = checkChainEnvVariables();
            const isUnlockedVault = (0, encrypt_1.isUnlockedEcosystemVault)();
            return {
                metrics: [
                    { metric: 'Total Master Wallets', value: totalMasterWallets },
                    { metric: 'Active Master Wallets', value: activeMasterWallets },
                    { metric: 'Total Custodial Wallets', value: totalCustodialWallets },
                    { metric: 'Active Custodial Wallets', value: activeCustodialWallets },
                    { metric: 'Total Tokens', value: totalTokens },
                    { metric: 'Active Tokens', value: activeTokens },
                    { metric: 'Total Markets', value: totalMarkets },
                    { metric: 'Active Markets', value: activeMarkets },
                ],
                chains,
                isUnlockedVault,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch analytics data: ${error.message}`);
        }
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user) {
            throw new Error('Unauthorized');
        }
        try {
        }
        catch (error) {
            throw new Error(`Failed to fetch master wallet: ${error.message}`);
        }
    }),
};
function checkChainEnvVariables() {
    const utxoChains = ['BTC', 'LTC', 'DOGE', 'DASH'];
    const evmChains = [
        'ETH',
        'BSC',
        'POLYGON',
        'FTM',
        'OPTIMISM',
        'ARBITRUM',
        'BASE',
        'CELO',
    ];
    const utxoChainInfo = utxoChains.map((chain) => {
        const network = process.env[`${chain}_NETWORK`] || 'mainnet';
        const nodeProvider = process.env[`${chain}_NODE`] || 'blockcypher';
        const blockcypherToken = chain === 'BTC' ? process.env.BLOCKCYPHER_TOKEN : undefined;
        return {
            chain,
            info: {
                network,
                nodeProvider,
                blockcypherToken,
            },
        };
    });
    const evmChainInfo = evmChains.map((chain) => {
        const network = process.env[`${chain}_NETWORK`] || '';
        const rpc = Boolean(process.env[`${chain}_${network.toUpperCase()}_RPC`]);
        const rpcWss = Boolean(process.env[`${chain}_${network.toUpperCase()}_RPC_WSS`]);
        const explorerApi = Boolean(process.env[`${chain}_EXPLORER_API_KEY`]);
        return {
            chain,
            info: {
                network,
                rpc,
                rpcWss,
                explorerApi,
            },
        };
    });
    return [...utxoChainInfo, ...evmChainInfo];
}
exports.checkChainEnvVariables = checkChainEnvVariables;
