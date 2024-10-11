import { handleController } from '~~/utils'
import {
  createEcosystemToken,
  getAllEcosystemTokens,
  getEcosystemTokenById,
  getEcosystemTokensAll,
  importEcosystemToken,
  updateAdminToken,
  updateAdminTokenIcon,
  updateStatusBulk,
} from './queries'

import { ContractFactory, ethers } from 'ethers'
import type { EcosystemMasterWallet } from '~~/types'
import { decrypt } from '~~/utils/encrypt'
import { chainConfigs, getProvider, getSmartContract } from '../../utils'
import { getAdjustedGasPrice } from '../../utils/gas'
import { fetchTokenHolders } from '../../utils/tokens'
import { getMasterWalletByChainFull } from '../wallets/queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { filter, perPage, page } = query
    const perPageNumber = perPage ? parseInt(perPage, 10) : 10
    const pageNumber = page ? parseInt(page, 10) : 1
    return await getAllEcosystemTokens(filter, perPageNumber, pageNumber)
  }),

  list: handleController(async () => {
    return await getEcosystemTokensAll()
  }),

  show: handleController(async (_, __, params) => {
    const { chain, currency } = params
    return await getEcosystemTokenById(chain, currency)
  }),

  store: handleController(async (_, __, ___, ____, body) => {
    const {
      chain,
      name,
      currency,
      initialSupply,
      initialHolder,
      decimals,
      cap,
    } = body

    // Get the master wallet for this chain
    const masterWallet = await getMasterWalletByChainFull(chain)
    if (!masterWallet) {
      throw new Error(`Master wallet for chain ${chain} not found`)
    }

    // Deploy the token contract
    const contract = await deployTokenContract(
      masterWallet,
      chain,
      name,
      currency,
      initialHolder,
      decimals,
      initialSupply,
      cap,
    )

    const type = chainConfigs[chain]?.smartContract?.name
    if (!type) {
      throw new Error(`Smart contract type not found for chain ${chain}`)
    }
    const network = process.env[`${chain}_NETWORK`]
    if (!network) {
      throw new Error(`Network not found for chain ${chain}`)
    }

    return await createEcosystemToken(
      chain,
      name,
      currency,
      contract,
      decimals,
      type,
      network,
    )
  }),

  import: handleController(async (_, __, ___, ____, body) => {
    const {
      name,
      currency,
      chain,
      network,
      type,
      contract,
      decimals,
      contractType,
    } = body

    return await importEcosystemToken(
      name,
      currency,
      chain,
      network,
      type,
      contract,
      decimals,
      contractType,
    )
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { precision, limits, fees } = body
    return await updateAdminToken(id, precision, limits, fees)
  }),

  updateIcon: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { icon } = body
    return await updateAdminTokenIcon(id, icon)
  }),

  holders: handleController(async (_, __, params, ____, _____, user) => {
    try {
      const { chain, currency } = params
      const token = await getEcosystemTokenById(chain, currency)
      if (!token) {
        throw new Error(
          `Token not found for chain ${chain} and currency ${currency}`,
        )
      }
      const holders = await fetchTokenHolders(
        chain,
        token.network,
        token.contract,
      )
      return {
        token,
        holders,
      }
    } catch (error) {
      throw new Error(`Failed to fetch token holders: ${error.message}`)
    }
  }),

  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      const { ids, status } = body
      await updateStatusBulk(ids, status)
      return {
        message: 'Currencies updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}

async function deployTokenContract(
  masterWallet: EcosystemMasterWallet,
  chain: string,
  name: string,
  symbol: string,
  receiver: string,
  decimals: number,
  initialBalance: number,
  cap: number,
): Promise<string | undefined> {
  try {
    // Initialize Ethereum provider
    const provider = getProvider(chain)
    if (!provider) {
      throw new Error('Provider not initialized')
    }

    // Decrypt mnemonic
    const decryptedData = JSON.parse(decrypt(masterWallet.data))
    if (!decryptedData || !decryptedData.privateKey) {
      throw new Error('Decrypted data or Mnemonic not found')
    }
    const { privateKey } = decryptedData

    // Create a signer
    const signer = new ethers.Wallet(privateKey).connect(provider)

    // Get contract ABI and Bytecode
    const smartContractFile = chainConfigs[chain]?.smartContract?.file
    if (!smartContractFile) {
      throw new Error(`Smart contract file not found for chain ${chain}`)
    }
    const { abi, bytecode } = await getSmartContract('token', smartContractFile)
    if (!abi || !bytecode) {
      throw new Error('Smart contract ABI or Bytecode not found')
    }
    // Create Contract Factory
    const tokenFactory = new ContractFactory(abi, bytecode, signer)

    if (initialBalance === undefined || cap === undefined) {
      throw new Error('Initial balance or Cap is undefined')
    }

    // Convert initialBalance to its smallest unit based on the number of decimals
    const adjustedInitialBalance = ethers.parseUnits(
      initialBalance.toString(),
      decimals,
    )
    const adjustedCap = ethers.parseUnits(cap.toString(), decimals)

    // Fetch adjusted gas price
    const gasPrice = await getAdjustedGasPrice(provider)

    // Deploy the contract with dynamic gas settings
    const tokenContract = await tokenFactory.deploy(
      name,
      symbol,
      receiver,
      decimals,
      adjustedCap,
      adjustedInitialBalance,
      {
        gasPrice: gasPrice,
      },
    )

    // Wait for the contract to be deployed
    const response = await tokenContract.waitForDeployment()

    return await response.getAddress()
  } catch (error) {
    // if (error.code === 'CALL_EXCEPTION') {
    //   throw new Error('Token already exists')
    // }
    throw new Error(error.message)
  }
}

export const getContractAbi = async (
  chain: string,
  network: string,
  contractAddress: string,
) => {
  const chainConfig = chainConfigs[chain]
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  const apiKey = process.env[`${chain}_EXPLORER_API_KEY`]
  if (!apiKey) {
    throw new Error(`API Key for ${chain} is not set`)
  }

  const networkConfig = chainConfig.networks[network]
  if (!networkConfig || !networkConfig.explorer) {
    throw new Error(`Unsupported network: ${network} for chain: ${chain}`)
  }

  const apiUrl = `https://${networkConfig.explorer}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`

  let data
  try {
    const response = await fetch(apiUrl)
    data = await response.json()
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`)
  }

  if (data.status !== '1') {
    throw new Error(`API Error: ${data.message}`)
  }

  return data.result
}
