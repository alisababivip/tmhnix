import { differenceInMinutes } from 'date-fns'
import fetch from 'node-fetch'
import { chainConfigs } from '.'
import { redis } from '../../../utils/redis'
import { fetchUTXOTransactions } from './utxo'
const HTTP_TIMEOUT = 30000
const CACHE_EXPIRATION = 30

type ParsedTransaction = {
  timestamp: string
  hash: string
  from: string
  to: string
  amount: string
  method: string
  methodId: string
  contract: string
  confirmations: string
  status: string
  isError: string
  gas: string
  gasPrice: string
  gasUsed: string
}

export const fetchTransactions = async (chain: string, address: string) => {
  const config = chainConfigs[chain]
  if (!config) {
    throw new Error(`Unsupported EVM chain: ${chain}`)
  }
  try {
    if (['BTC', 'LTC', 'DOGE'].includes(chain)) {
      return await fetchUTXOTransactions(chain, address)
    } else {
      return await fetchAndParseTransactions(address, chain, config)
    }
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

const fetchAndParseTransactions = async (
  address: string,
  chain: string,
  config: any,
) => {
  const cacheKey = `wallet:${address}:transactions:${chain.toLowerCase()}`
  if (config.cache) {
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }
  }

  const rawTransactions = await config.fetchFunction(address, chain)
  const parsedTransactions = parseRawTransactions(rawTransactions)

  if (config.cache) {
    const cacheData = {
      transactions: parsedTransactions,
      timestamp: new Date().toISOString(),
    }
    await redis.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(cacheData))
  }

  return parsedTransactions
}

const getCachedData = async (cacheKey: string) => {
  let cachedData: any = await redis.get(cacheKey)
  if (cachedData && typeof cachedData === 'string') {
    cachedData = JSON.parse(cachedData)
  }
  const now = new Date()
  const lastUpdated = new Date(cachedData?.timestamp)
  if (differenceInMinutes(now, lastUpdated) < 30) {
    return cachedData?.transactions
  }
  return null
}

const parseRawTransactions = (
  rawTransactions: any,
): Promise<ParsedTransaction> => {
  if (!Array.isArray(rawTransactions?.result)) {
    throw new Error(`Invalid raw transactions format`)
  }

  return rawTransactions.result.map((rawTx: any) => {
    return {
      timestamp: rawTx.timeStamp,
      hash: rawTx.hash,
      from: rawTx.from,
      to: rawTx.to,
      amount: rawTx.value,
      method: rawTx.functionName,
      methodId: rawTx.methodId,
      contract: rawTx.contractAddress,
      confirmations: rawTx.confirmations,
      status: rawTx.txreceipt_status,
      isError: rawTx.isError,
      gas: rawTx.gas,
      gasPrice: rawTx.gasPrice,
      gasUsed: rawTx.gasUsed,
    }
  })
}

export const fetchGeneralTransactions = async (
  chain: string,
  address: string,
) => {
  const chainConfig = chainConfigs[chain]

  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`)
  }

  // Determine the network to use for this chain
  const networkEnvVar = `${chain}_NETWORK`
  const networkName = process.env[networkEnvVar]

  if (!networkName) {
    throw new Error(`Environment variable ${networkEnvVar} is not set`)
  }

  const apiEnvVar = `${chain}_EXPLORER_API_KEY`
  const apiKey = process.env[apiEnvVar]

  if (!apiKey) {
    throw new Error(`Environment variable ${apiEnvVar} is not set`)
  }

  const network = chainConfig.networks[networkName]

  if (!network || !network.explorer) {
    throw new Error(
      `Unsupported or misconfigured network: ${networkName} for chain: ${chain}`,
    )
  }
  const url = `https://${network.explorer}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
  try {
    const response = await fetch(url, { timeout: HTTP_TIMEOUT })
    return await response.json()
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`)
  }
}

export const fetchPublicTransactions = async (url: string) => {
  try {
    const response = await fetch(url, { timeout: HTTP_TIMEOUT })
    return await response.json()
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`)
  }
}
