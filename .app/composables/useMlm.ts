import useAdminMlm from './mlm/admin'
import useAdminReferralConditions from './mlm/admin/conditions'
import useAdminReferrals from './mlm/admin/referrals'
import useAdminRewards from './mlm/admin/rewards'
import useMlmReferral from './mlm/user/referrals'
import useMlmRewards from './mlm/user/rewards'

// Composable to make blog tasks easier
export default function useMlm() {
  const adminMlm = useAdminMlm()
  const adminReferrals = useAdminReferrals()
  const adminRewards = useAdminRewards()
  const adminReferralConditions = useAdminReferralConditions()
  const mlmReferrals = useMlmReferral()
  const mlmRewards = useMlmRewards()

  return {
    ...adminMlm,
    ...adminReferrals,
    ...adminRewards,
    ...adminReferralConditions,
    ...mlmReferrals,
    ...mlmRewards,
  }
}
