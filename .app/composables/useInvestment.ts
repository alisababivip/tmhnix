import useUserInvestment from './investment'
import useAdminInvestmentPlan from './investment/plan'

// Composable to make blog tasks easier
export default function useInvestment() {
  // Get all functions from individual composables
  const adminInvestmentPlanFunctions = useAdminInvestmentPlan()
  const investmentFunctions = useUserInvestment()

  return {
    ...adminInvestmentPlanFunctions,
    ...investmentFunctions,
  }
}
