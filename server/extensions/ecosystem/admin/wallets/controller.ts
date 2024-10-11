// adminWalletController.ts
import { differenceInMinutes } from 'date-fns'
import { ContractFactory, ethers } from 'ethers'
import fs from 'fs'
import { createLogger } from '~~/logger'
import type { EcosystemMasterWallet, Web3WalletData } from '~~/types'
import { handleController } from '~~/utils'
import { decrypt, encrypt } from '~~/utils/encrypt'
import { redis } from '~~/utils/redis'
import { getEcosystemTokensByChain } from '../../admin/tokens/queries'
import { chainConfigs, getProvider, getSmartContract } from '../../utils'
import { getAdjustedGasPrice } from '../../utils/gas'
import { fetchTransactions } from '../../utils/transactions'
import { createUTXOWallet, fetchUTXOWalletBalance } from '../../utils/utxo'
import { storeCustodialWallet } from '../custodial/queries'
import {
  createMasterWallet,
  getAllMasterWallets,
  getMasterWalletByChain,
  getMasterWalletByChainFull,
  getMasterWalletById,
  updateMasterWalletBalance,
} from './queries'
const logger = createLogger('Ecosystem Master Wallets')

const FIVE_MINUTES = 5

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('Unauthorized')
    return await getAllMasterWallets()
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    try {
      return await getMasterWalletById(params.uuid)
    } catch (error) {
      throw new Error(`Failed to fetch master wallet: ${error.message}`)
    }
  }),

  showChain: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    try {
      return await getMasterWalletByChain(params.chain)
    } catch (error) {
      throw new Error(`Failed to fetch master wallet: ${error.message}`)
    }
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    try {
      const { chain } = body
      const existingWallet = await getMasterWalletByChain(chain)
      if (existingWallet) {
        throw new Error(`Master wallet already exists: ${chain}`)
      }

      const walletData = await createAndEncryptWallet(chain)
      return await createMasterWallet(walletData, chainConfigs[chain].currency)
    } catch (error) {
      throw new Error(`Failed to create master wallet: ${error.message}`)
    }
  }),

  balance: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('Unauthorized')

    try {
      const wallets = await getAllMasterWallets()
      await Promise.all(wallets.map(getWalletBalance))
      return wallets
    } catch (error) {
      throw new Error(`Failed to fetch master wallets: ${error.message}`)
    }
  }),

  transactions: handleController(async (_, __, params) => {
    try {
      const { chain, address } = params
      return await fetchTransactions(chain, address)
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`)
    }
  }),

  internalTransactions: handleController(
    async (_, __, params, ____, _____, user) => {
      try {
        const { chain, address } = params
        return await fetchTransactions(chain, address)
      } catch (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }
    },
  ),

  tokens: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) throw new Error('Unauthorized')

    try {
      const { uuid } = params
      const wallet = await getMasterWalletById(uuid)
      if (!wallet) {
        throw new Error(`Master wallet not found: ${uuid}`)
      }

      const tokens = await getEcosystemTokensByChain(wallet.chain)
      return tokens
    } catch (error) {
      throw new Error(`Failed to fetch tokens: ${error.message}`)
    }
  }),

  deployCustodial: handleController(async (_, __, ___, query, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { chain } = query
      const wallet = await getMasterWalletByChainFull(chain)
      if (!wallet) {
        throw new Error(`Master wallet not found for chain: ${chain}`)
      }
      const walletContractAddress = await deployCustodialContract(wallet)
      if (!walletContractAddress) {
        throw new Error('Failed to deploy custodial wallet contract')
      }
      const custodialWallet = await storeCustodialWallet(
        wallet.id,
        wallet.chain,
        walletContractAddress,
      )
      return custodialWallet
    } catch (error) {
      throw new Error(`Failed to deploy custodial wallet contract: ${error}`)
    }
  }),
}

export const createAndEncryptWallet = async (
  chain: string,
): Promise<Web3WalletData> => {
  let wallet

  // Check if the chain is an EVM chain or a UTXO chain
  if (['BTC', 'LTC', 'DOGE'].includes(chain)) {
    // Generate a UTXO wallet
    wallet = createUTXOWallet(chain)
  } else {
    // Generate an EVM wallet
    wallet = createEVMWallet()
  }

  // Define the directory and file path
  const walletDir = `${process.cwd()}/ecosystem/wallets`
  const walletFilePath = `${walletDir}/${chain}.json`
  // Check if directory exists, if not create it
  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true })
  }
  await fs.writeFileSync(walletFilePath, JSON.stringify(wallet), 'utf8')

  // Encrypt all the wallet details
  const data = encrypt(JSON.stringify(wallet.data))

  return {
    address: wallet.address,
    chain,
    data,
  }
}

const createEVMWallet = () => {
  // Generate a random wallet
  const wallet = ethers.Wallet.createRandom()

  // Derive the HDNode from the wallet's mnemonic
  const hdNode = ethers.HDNodeWallet.fromPhrase(wallet.mnemonic.phrase)

  const xprv = hdNode.extendedKey
  const xpub = hdNode.neuter().extendedKey

  const mnemonic = hdNode.mnemonic.phrase
  const address = hdNode.address
  const publicKey = hdNode.publicKey
  const privateKey = hdNode.privateKey
  const path = hdNode.path
  const chainCode = hdNode.chainCode

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
  }
}

const getWalletBalance = async (
  wallet: EcosystemMasterWallet,
): Promise<void> => {
  try {
    const cacheKey = `wallet:${wallet.uuid}:balance`
    let cachedBalanceData: any = await redis.get(cacheKey)

    if (cachedBalanceData) {
      if (typeof cachedBalanceData !== 'object') {
        cachedBalanceData = JSON.parse(cachedBalanceData)
      }

      const now = new Date()
      const lastUpdated = new Date(cachedBalanceData.timestamp)

      if (
        differenceInMinutes(now, lastUpdated) < 5 &&
        parseFloat(cachedBalanceData.balance) !== 0
      ) {
        return
      }
    }

    let formattedBalance
    if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(wallet.chain)) {
      formattedBalance = await fetchUTXOWalletBalance(
        wallet.chain,
        wallet.address,
      )
    } else {
      const provider = getProvider(wallet.chain)

      const balance = await provider.getBalance(wallet.address)

      const decimals = chainConfigs[wallet.chain].decimals
      formattedBalance = ethers.formatUnits(balance.toString(), decimals)
    }

    if (!formattedBalance || isNaN(parseFloat(formattedBalance))) {
      logger.error(
        `Invalid formatted balance for ${wallet.chain} wallet: ${formattedBalance}`,
      )
      return
    }

    if (parseFloat(formattedBalance) === 0) {
      return
    }

    await updateMasterWalletBalance(wallet.uuid, parseFloat(formattedBalance))

    const cacheData = {
      balance: formattedBalance,
      timestamp: new Date().toISOString(),
    }

    await redis.setex(cacheKey, 300, JSON.stringify(cacheData))
  } catch (error) {
    logger.error(
      `Failed to fetch ${wallet.chain} wallet balance: ${error.message}`,
    )
  }
}

async function deployCustodialContract(
  masterWallet: EcosystemMasterWallet,
): Promise<string | undefined> {
  try {
    // Initialize Ethereum provider
    const provider = getProvider(masterWallet.chain)
    if (!provider) {
      throw new Error('Provider not initialized')
    }

    // Decrypt mnemonic
    let decryptedData
    try {
      decryptedData = JSON.parse(decrypt(masterWallet.data))
    } catch (error) {
      throw new Error(`Failed to decrypt mnemonic: ${error.message}`)
    }
    if (!decryptedData || !decryptedData.privateKey) {
      throw new Error('Decrypted data or Mnemonic not found')
    }
    const { privateKey } = decryptedData

    // Create a signer
    const signer = new ethers.Wallet(privateKey).connect(provider)

    const { abi, bytecode } = await getSmartContract(
      'wallet',
      'CustodialWalletERC20',
    )
    if (!abi || !bytecode) {
      throw new Error('Smart contract ABI or Bytecode not found')
    }

    // Create Contract Factory
    const custodialWalletFactory = new ContractFactory(abi, bytecode, signer)

    // Fetch adjusted gas price
    const gasPrice = await getAdjustedGasPrice(provider)

    // Deploy the contract with dynamic gas settings
    const custodialWalletContract = await custodialWalletFactory.deploy(
      masterWallet.address,
      {
        gasPrice: gasPrice,
      },
    )

    // Wait for the contract to be deployed
    const response = await custodialWalletContract.waitForDeployment()

    return await response.getAddress()
  } catch (error) {
    throw new Error(error.message)
  }
}
