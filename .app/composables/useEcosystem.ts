import useEcosystemAdmin from './ecosystem/admin'
import useEcosystemKMS from './ecosystem/kms'
import useEcosystemAdminMarkets from './ecosystem/markets/admin'
import useEcosystemUserMarkets from './ecosystem/markets/user'
import useEcosystemUserOrders from './ecosystem/orders/user'
import useEcosystemAdminTokens from './ecosystem/tokens/admin'
import useEcosystemTokens from './ecosystem/tokens/user'
import useEcosystemAdminWallets from './ecosystem/wallets/admin'
import useEcosystemAdminLedgers from './ecosystem/wallets/ledger'
import useEcosystemUserWallets from './ecosystem/wallets/user'

// Composable to make blog tasks easier
export default function useEcosystem() {
  // Get all functions from individual composables
  const adminKmsFunctions = useEcosystemKMS()
  const adminWalletFunctions = useEcosystemAdminWallets()
  const userWalletFunctions = useEcosystemUserWallets()
  const adminTokenFunctions = useEcosystemAdminTokens()
  const userTokenFunctions = useEcosystemTokens()
  const adminMarketFunctions = useEcosystemAdminMarkets()
  const userMarketFunctions = useEcosystemUserMarkets()
  const userOrderFunctions = useEcosystemUserOrders()
  const adminLedgerFunctions = useEcosystemAdminLedgers()
  const adminFunctions = useEcosystemAdmin()

  return {
    ...adminKmsFunctions,
    ...adminWalletFunctions,
    ...userWalletFunctions,
    ...adminTokenFunctions,
    ...userTokenFunctions,
    ...adminMarketFunctions,
    ...userMarketFunctions,
    ...userOrderFunctions,
    ...adminLedgerFunctions,
    ...adminFunctions,
  }
}
