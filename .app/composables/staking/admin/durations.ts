export default function useAdminStakingDurations() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminStakingDurations = async () => {
    return await $fetch(`${apiPath}/api/admin/staking/durations`, {
      credentials: 'include',
    })
  }

  const getAdminStakingDuration = async (id) => {
    return await $fetch(`${apiPath}/api/admin/staking/durations/${id}`, {
      credentials: 'include',
    })
  }

  const createAdminStakingDuration = async (
    pool_id: number,
    duration: number,
    interest_rate: number,
  ) => {
    return await $fetch(`${apiPath}/api/admin/staking/durations`, {
      method: 'POST',
      body: {
        pool_id,
        duration,
        interest_rate,
      },
      credentials: 'include',
    })
  }

  const updateAdminStakingDuration = async (
    id: number,
    pool_id: number,
    duration: number,
    interest_rate: number,
  ) => {
    return await $fetch(`${apiPath}/api/admin/staking/durations/${id}`, {
      method: 'PUT',
      body: {
        pool_id,
        duration,
        interest_rate,
      },
      credentials: 'include',
    })
  }

  const deleteAdminStakingDuration = async (id) => {
    return await $fetch(`${apiPath}/api/admin/staking/durations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminStakingDurations,
    getAdminStakingDuration,
    createAdminStakingDuration,
    updateAdminStakingDuration,
    deleteAdminStakingDuration,
  }
}
