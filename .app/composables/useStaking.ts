import useAdminStakingPools from './staking/admin/pools'
import useAdminStakingDurations from './staking/admin/durations'
import useAdminStakingLogs from './staking/admin/logs'
import useAdminStaking from './staking/admin'
import useUserStakingPools from './staking/user/pools'
import useUserStakingLogs from './staking/user/logs'
import useUserStaking from './staking/user'

export default function useStaking() {
  // Admin composables
  const adminStakingPools = useAdminStakingPools()
  const adminStakingDurations = useAdminStakingDurations()
  const adminStakingLogs = useAdminStakingLogs()
  const adminStaking = useAdminStaking()

  // User composables
  const userStakingPools = useUserStakingPools()
  const userStakingLogs = useUserStakingLogs()
  const userStaking = useUserStaking()

  // Combine and return all functions and data from the composables
  return {
    // Admin
    ...adminStakingPools,
    ...adminStakingDurations,
    ...adminStakingLogs,
    ...adminStaking,
    // User
    ...userStakingPools,
    ...userStakingLogs,
    ...userStaking,
  }
}
