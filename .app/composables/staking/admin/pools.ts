export default function useAdminStakingPools() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminStakingPools = async () => {
    return await $fetch(`${apiPath}/api/admin/staking/pools`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const getAdminStakingPool = async (id) => {
    return await $fetch(`${apiPath}/api/admin/staking/pools/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const createAdminStakingPool = async (
    name: string,
    description: string | null,
    currency: string,
    chain: string,
    type: string,
    min_stake: number,
    max_stake: number,
    status: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/staking/pools`, {
      method: 'POST',
      body: {
        name,
        description,
        currency,
        chain,
        type,
        min_stake,
        max_stake,
        status,
      },
      credentials: 'include',
    })
  }

  const updateAdminStakingPool = async (
    id,
    name: string,
    description: string | null,
    currency: string,
    chain: string,
    type: string,
    min_stake: number,
    max_stake: number,
    status: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/staking/pools/${id}`, {
      method: 'PUT',
      body: {
        name,
        description,
        currency,
        chain,
        type,
        min_stake,
        max_stake,
        status,
      },
      credentials: 'include',
    })
  }

  const deleteAdminStakingPool = async (id) => {
    return await $fetch(`${apiPath}/api/admin/staking/pools/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminStakingPools,
    getAdminStakingPool,
    createAdminStakingPool,
    updateAdminStakingPool,
    deleteAdminStakingPool,
  }
}
