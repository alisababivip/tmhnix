import useAITrading from './ai-trading'
import useAdminAITrading from './ai-trading/admin'
import useAdminAITradingDuration from './ai-trading/admin/durations'
import useAdminAITradingPlan from './ai-trading/admin/plans'
import useAITradingPlan from './ai-trading/plans'

// Composable to make blog tasks easier
export default function useAiTrading() {
  // Get all functions from individual composables
  const adminAITradingDuration = useAdminAITradingDuration()
  const adminAITradingPlan = useAdminAITradingPlan()
  const adminAITrading = useAdminAITrading()
  const aiTrading = useAITrading()
  const aiTradingPlan = useAITradingPlan()

  return {
    ...adminAITradingDuration,
    ...adminAITradingPlan,
    ...adminAITrading,
    ...aiTrading,
    ...aiTradingPlan,
  }
}
