export default function useAdminStakingLogs() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminStakingLogs = async () => {
    return await $fetch(`${apiPath}/api/admin/staking/logs`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const getAdminStakingLog = async (id) => {
    return await $fetch(`${apiPath}/api/admin/staking/logs/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminStakingLogs,
    getAdminStakingLog,
  }
}
