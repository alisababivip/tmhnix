export default function useUserDisputes() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserDisputes = async () => {
    return await $fetch(`${apiPath}/api/p2p/disputes`, {
      credentials: 'include',
    })
  }

  const getUserDispute = async (id) => {
    return await $fetch(`${apiPath}/api/p2p/disputes/${id}`, {
      credentials: 'include',
    })
  }

  const createUserDispute = async (tradeId, reason) => {
    return await $fetch(`${apiPath}/api/p2p/disputes/create`, {
      method: 'POST',
      body: { trade_id: tradeId, reason },
      credentials: 'include',
    })
  }

  return {
    getUserDisputes,
    getUserDispute,
    createUserDispute,
  }
}
