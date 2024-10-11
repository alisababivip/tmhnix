export default function useUserStakingActions() {
  const apiPath = useRuntimeConfig().public.apiPath

  const stakeTokens = async (
    pool_id: string,
    amount: number,
    duration_id: string,
  ) => {
    return await $fetch(`${apiPath}/api/staking/stake`, {
      method: 'POST',
      body: {
        pool_id,
        amount,
        duration_id,
      },
      credentials: 'include',
    })
  }

  const withdrawStake = async (stakeId) => {
    return await $fetch(`${apiPath}/api/staking/withdraw`, {
      method: 'POST',
      body: { stake_id: stakeId },
      credentials: 'include',
    })
  }

  const listMyStakes = async () => {
    return await $fetch(`${apiPath}/api/staking/my-stakes`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    stakeTokens,
    withdrawStake,
    listMyStakes,
  }
}
