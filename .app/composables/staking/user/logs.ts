export default function useUserStakingLogs() {
  const apiPath = useRuntimeConfig().public.apiPath

  // Depending on how you want to handle -specific logs, you might need to pass  identification, like Id.
  const getStakingLogs = async () => {
    return await $fetch(`${apiPath}/api/staking`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const getStakingLog = async (id) => {
    return await $fetch(`${apiPath}/api/staking/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getStakingLogs,
    getStakingLog,
  }
}
