import { handleController } from '~~/utils'

import {
  getActiveStakes,
  getActiveStakingPools,
  getTotalStakes,
  getTotalStakingPools,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    try {
      const totalStakingPools = await getTotalStakingPools()
      const activeStakingPools = await getActiveStakingPools()
      const totalStakes = await getTotalStakes()
      const activeStakes = await getActiveStakes()

      return {
        metrics: [
          { metric: 'Total Staking Pools', value: totalStakingPools },
          { metric: 'Active Staking Pools', value: activeStakingPools },
          { metric: 'Total Stakes', value: totalStakes },
          { metric: 'Active Stakes', value: activeStakes },
        ],
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch staking analytics data: ${error.message}`,
      )
    }
  }),
}
