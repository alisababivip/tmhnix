export default function useUserP2PTrades() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserP2PTrades = async () => {
    return await $fetch(`${apiPath}/api/p2p/trades`, { credentials: 'include' })
  }

  const getUserP2PTrade = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}`, {
      credentials: 'include',
    })
  }

  const createUserP2PTrade = async (offer_id, amount) => {
    return await $fetch(`${apiPath}/api/p2p/trades`, {
      method: 'POST',
      body: { offer_id, amount },
      credentials: 'include',
    })
  }

  const sendMessage = async (uuid, message, isSeller) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/chat`, {
      method: 'POST',
      body: { message, isSeller },
      credentials: 'include',
    })
  }

  const cancelTrade = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/cancel`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  const markAsPaidTrade = async (uuid, txHash) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/markAsPaid`, {
      method: 'POST',
      credentials: 'include',
      body: {
        txHash,
      },
    })
  }

  const disputeTrade = async (uuid, reason) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/dispute`, {
      method: 'POST',
      credentials: 'include',
      body: {
        reason,
      },
    })
  }

  const cancelDisputeTrade = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/cancelDispute`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  const releaseTrade = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/release`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  const refundTrade = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/trades/${uuid}/refund`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  return {
    getUserP2PTrades,
    getUserP2PTrade,
    createUserP2PTrade,
    sendMessage,
    cancelTrade,
    markAsPaidTrade,
    disputeTrade,
    releaseTrade,
    refundTrade,
    cancelDisputeTrade,
  }
}
