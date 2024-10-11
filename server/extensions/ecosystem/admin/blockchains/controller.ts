// adminWalletController.ts
import { createLogger } from '~~/logger'
import { handleController } from '~~/utils'
import { isUnlockedEcosystemVault } from '~~/utils/encrypt'
import {
  getActiveCustodialWallets,
  getActiveMarkets,
  getActiveMasterWallets,
  getActiveTokens,
  getTotalCustodialWallets,
  getTotalMarkets,
  getTotalMasterWallets,
  getTotalTokens,
} from './queries'
const logger = createLogger('Ecosystem Blockchains')

export const controllers = {
  index: handleController(async (_, __, ___, ____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }

    try {
      const totalMasterWallets = await getTotalMasterWallets()
      const activeMasterWallets = await getActiveMasterWallets()
      const totalCustodialWallets = await getTotalCustodialWallets()
      const activeCustodialWallets = await getActiveCustodialWallets()
      const totalTokens = await getTotalTokens()
      const activeTokens = await getActiveTokens()
      const totalMarkets = await getTotalMarkets()
      const activeMarkets = await getActiveMarkets()
      const chains = checkChainEnvVariables()
      const isUnlockedVault = isUnlockedEcosystemVault()

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
      }
    } catch (error) {
      throw new Error(`Failed to fetch analytics data: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    try {
    } catch (error) {
      throw new Error(`Failed to fetch master wallet: ${error.message}`)
    }
  }),
}

export function checkChainEnvVariables(): any[] {
  const utxoChains = ['BTC', 'LTC', 'DOGE', 'DASH']
  const evmChains = [
    'ETH',
    'BSC',
    'POLYGON',
    'FTM',
    'OPTIMISM',
    'ARBITRUM',
    'BASE',
    'CELO',
  ]

  const utxoChainInfo = utxoChains.map((chain) => {
    const network = process.env[`${chain}_NETWORK`] || 'mainnet'
    const nodeProvider = process.env[`${chain}_NODE`] || 'blockcypher'
    const blockcypherToken =
      chain === 'BTC' ? process.env.BLOCKCYPHER_TOKEN : undefined

    return {
      chain,
      info: {
        network,
        nodeProvider,
        blockcypherToken,
      },
    }
  })

  const evmChainInfo = evmChains.map((chain) => {
    const network = process.env[`${chain}_NETWORK`] || ''
    const rpc = Boolean(process.env[`${chain}_${network.toUpperCase()}_RPC`])
    const rpcWss = Boolean(
      process.env[`${chain}_${network.toUpperCase()}_RPC_WSS`],
    )
    const explorerApi = Boolean(process.env[`${chain}_EXPLORER_API_KEY`])

    return {
      chain,
      info: {
        network,
        rpc,
        rpcWss,
        explorerApi,
      },
    }
  })

  return [...utxoChainInfo, ...evmChainInfo]
}
