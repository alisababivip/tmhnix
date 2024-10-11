import useForexInvestment from './forex'
import useAdminForex from './forex/admin'
import useAdminForexCurrency from './forex/admin/currencies'
import useAdminForexDuration from './forex/admin/durations'
import useAdminForexPlan from './forex/admin/plans'
import useAdminForexSignal from './forex/admin/signals'
import useForexPlan from './forex/plans'

// Composable to make blog tasks easier
export default function useForex() {
  // Get all functions from individual composables
  const adminForexDuration = useAdminForexDuration()
  const adminForexSignal = useAdminForexSignal()
  const adminForexCurrency = useAdminForexCurrency()
  const adminForexPlan = useAdminForexPlan()
  const adminForex = useAdminForex()
  const forexInvestment = useForexInvestment()
  const forexPlan = useForexPlan()

  return {
    ...adminForexDuration,
    ...adminForexSignal,
    ...adminForexCurrency,
    ...adminForexPlan,
    ...adminForex,
    ...forexInvestment,
    ...forexPlan,
  }
}
