import { handleController } from '~~/utils'
import {
  getActiveReferrals,
  getClaimedRewards,
  getTotalReferrals,
  getTotalRewards,
} from './queries'

export const controllers = {
  analytics: handleController(async () => {
    try {
      const totalReferrals = await getTotalReferrals()
      const activeReferrals = await getActiveReferrals()
      const totalRewards = await getTotalRewards()
      const claimedRewards = await getClaimedRewards()

      return {
        metrics: [
          { metric: 'Total Referrals', value: totalReferrals },
          { metric: 'Active Referrals', value: activeReferrals },
          { metric: 'Total Rewards', value: totalRewards },
          { metric: 'Claimed Rewards', value: claimedRewards },
        ],
      }
    } catch (error) {
      throw new Error(`Failed to fetch MLM analytics data: ${error.message}`)
    }
  }),
}
