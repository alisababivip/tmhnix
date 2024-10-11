export default function useUserStakingPools() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getStakingPools = async () => {
    return await $fetch(`${apiPath}/api/staking/pools`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const getStakingPool = async (id) => {
    return await $fetch(`${apiPath}/api/staking/pools/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getStakingPools,
    getStakingPool,
  }
}
