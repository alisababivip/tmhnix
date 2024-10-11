"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfigs = exports.delay = exports.initializeProvider = exports.getTimestampInSeconds = exports.getChainId = exports.getSmartContract = exports.getWssProvider = exports.getProvider = void 0;
const ethers_1 = require("ethers");
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../logger");
const transactions_1 = require("./transactions");
const utxo_1 = require("./utxo");
const logger = (0, logger_1.createLogger)('Ecosystem Wallets');
const getEnv = (key, defaultValue = '') => process.env[key] || defaultValue;
const getProvider = (chainSymbol) => {
    try {
        const chainConfig = exports.chainConfigs[chainSymbol];
        if (!chainConfig)
            throw new Error(`Unsupported chain: ${chainSymbol}`);
        const networkName = getEnv(`${chainSymbol}_NETWORK`);
        if (!networkName)
            throw new Error(`Environment variable ${chainSymbol}_NETWORK is not set`);
        const rpcName = getEnv(`${chainSymbol}_${networkName.toUpperCase()}_RPC`);
        if (!rpcName)
            throw new Error(`Environment variable ${rpcName} is not set`);
        return new ethers_1.JsonRpcProvider(rpcName);
    }
    catch (error) {
        logger.error(error.message);
        throw error;
    }
};
exports.getProvider = getProvider;
const getWssProvider = (chainSymbol) => {
    try {
        const chainConfig = exports.chainConfigs[chainSymbol];
        if (!chainConfig) {
            throw new Error(`Unsupported chain: ${chainSymbol}`);
        }
        const networkName = getEnv(`${chainSymbol}_NETWORK`);
        if (!networkName) {
            throw new Error(`Environment variable ${chainSymbol}_NETWORK is not set`);
        }
        const rpcWssVar = `${chainSymbol}_${networkName.toUpperCase()}_RPC_WSS`;
        const rpcWssUrl = getEnv(rpcWssVar);
        if (!rpcWssUrl) {
            throw new Error(`Environment variable ${rpcWssVar} is not set`);
        }
        return new ethers_1.WebSocketProvider(rpcWssUrl);
    }
    catch (error) {
        logger.error(error.message);
        throw error;
    }
};
exports.getWssProvider = getWssProvider;
async function getSmartContract(path, name) {
    const filePath = `${process.cwd()}/ecosystem/smart-contracts/${path}/${name}.json`;
    try {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
        const contractJson = JSON.parse(fileContent);
        const { abi, bytecode } = contractJson;
        if (!bytecode || !abi)
            throw new Error(`Failed to extract bytecode or ABI for ${name}`);
        return { abi, bytecode };
    }
    catch (error) {
        logger.error(`Failed to read contract JSON for ${name}: ${error.message}`);
        throw error;
    }
}
exports.getSmartContract = getSmartContract;
// Get chain ID
const getChainId = async (provider) => {
    return (await provider.getNetwork()).chainId;
};
exports.getChainId = getChainId;
function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
}
exports.getTimestampInSeconds = getTimestampInSeconds;
// Initialize Ethereum provider
const initializeProvider = (chain) => {
    const provider = (0, exports.getProvider)(chain);
    if (!provider) {
        throw new Error(`Failed to initialize provider for chain ${chain}`);
    }
    return provider;
};
exports.initializeProvider = initializeProvider;
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
exports.chainConfigs = {
    ETH: {
        name: 'Ethereum',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('ETH', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.etherscan.io',
            },
            sepolia: {
                explorer: 'api-sepolia.etherscan.io',
            },
        },
        currency: 'ETH',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    BSC: {
        name: 'Binance Smart Chain',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('BSC', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.bscscan.com',
            },
            testnet: {
                explorer: 'api-testnet.bscscan.com',
            },
        },
        currency: 'BNB',
        smartContract: {
            file: 'ERC20',
            name: 'BEP20',
        },
    },
    POLYGON: {
        name: 'Polygon',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('POLYGON', address),
        cache: true,
        networks: {
            matic: {
                explorer: 'api.polygonscan.com',
            },
            'matic-mumbai': {
                explorer: 'api-testnet.polygonscan.com',
            },
        },
        currency: 'MATIC',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    FTM: {
        name: 'Fantom',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('FTM', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.ftmscan.com',
            },
            testnet: {
                explorer: 'api-testnet.ftmscan.com',
            },
        },
        currency: 'FTM',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    OPTIMISM: {
        name: 'Optimism',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('OPTIMISM', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api-optimistic.etherscan.io',
            },
            goerli: {
                explorer: 'api-goerli-optimistic.etherscan.io',
            },
        },
        currency: 'ETH',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    ARBITRUM: {
        name: 'Arbitrum',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('ARBITRUM', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.arbiscan.io',
            },
            goerli: {
                explorer: 'api-goerli.arbiscan.io',
            },
        },
        currency: 'ETH',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    BASE: {
        name: 'Base',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('BASE', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.basescan.org',
            },
            goerli: {
                explorer: 'api-goerli.basescan.org',
            },
        },
        currency: 'ETH',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    CELO: {
        name: 'Celo',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('CELO', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.celoscan.io',
            },
            alfajores: {
                explorer: 'api-alfajores.celoscan.io',
            },
        },
        currency: 'CELO',
        smartContract: {
            file: 'ERC20',
            name: 'ERC20',
        },
    },
    TRON: {
        name: 'Tron',
        decimals: 6,
        fetchFunction: (address) => (0, transactions_1.fetchPublicTransactions)(`https://api.trongrid.io/v1/accounts/${address}/transactions?only_to=true&only_confirmed=true&limit=50&order_by=block_timestamp,asc`),
        cache: false,
        networks: {
            mainnet: {
                explorer: 'api.trongrid.io',
            },
            shasta: {
                explorer: 'api.shasta.trongrid.io',
            },
            nile: {
                explorer: 'api.nileex.io',
            },
        },
        currency: 'TRX',
    },
    RSK: {
        name: 'RSK',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchPublicTransactions)(`https://rootstock.blockscout.com/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'rootstock.blockscout.com/api/v2',
            },
        },
        currency: 'RBTC',
    },
    HECO: {
        name: 'Huobi ECO Chain',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchPublicTransactions)(`https://api.hecoinfo.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`),
        cache: false,
        networks: {
            mainnet: {
                explorer: 'api.hecoinfo.com',
            },
        },
        currency: 'HT',
        smartContract: {
            file: 'ERC20',
            name: 'HRC20',
        },
    },
    CRONOS: {
        name: 'Cronos',
        decimals: 18,
        fetchFunction: (address) => (0, transactions_1.fetchGeneralTransactions)('CRONOS', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'api.cronoscan.com',
            },
        },
        currency: 'CRON',
        smartContract: {
            file: 'ERC20',
            name: 'CRC20',
        },
    },
    BTC: {
        name: 'Bitcoin',
        decimals: 8,
        fetchFunction: (address) => (0, utxo_1.fetchUTXOTransactions)('BTC', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'blockchain.info',
            },
        },
        currency: 'BTC',
    },
    LTC: {
        name: 'Litecoin',
        decimals: 8,
        fetchFunction: (address) => (0, utxo_1.fetchUTXOTransactions)('LTC', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'chain.so',
            },
        },
        currency: 'LTC',
    },
    DOGE: {
        name: 'Dogecoin',
        decimals: 8,
        fetchFunction: (address) => (0, utxo_1.fetchUTXOTransactions)('DOGE', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'chain.so',
            },
        },
        currency: 'DOGE',
    },
    DASH: {
        name: 'Dash',
        decimals: 8,
        fetchFunction: (address) => (0, utxo_1.fetchUTXOTransactions)('DASH', address),
        cache: true,
        networks: {
            mainnet: {
                explorer: 'chain.so',
            },
        },
        currency: 'DASH',
    },
};
