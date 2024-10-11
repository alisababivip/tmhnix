export default function useUserStakingActions() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminStakingAnalytics = async () => {
    return await $fetch(`${apiPath}/api/admin/staking/analytics`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminStakingAnalytics,
  }
}
