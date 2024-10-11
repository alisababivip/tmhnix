import type { WalletType } from '~~/types'

export default function useUserP2POffers() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getP2POffers = async () => {
    return await $fetch(`${apiPath}/api/p2p/offers`, { credentials: 'include' })
  }

  const getUserP2POffers = async () => {
    return await $fetch(`${apiPath}/api/p2p/offers/user`, {
      credentials: 'include',
    })
  }

  const getUserP2POffer = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/offers/show/${uuid}`, {
      credentials: 'include',
    })
  }

  const getP2POffer = async (uuid) => {
    return await $fetch(`${apiPath}/api/p2p/offers/fetch/${uuid}`, {
      credentials: 'include',
    })
  }

  const createUserP2POffer = async (
    wallet_type: WalletType,
    currency: string,
    amount: number,
    price: number,
    payment_method_id: number,
    min_amount: number,
    max_amount: number,
    chain?: string,
  ) => {
    return await $fetch(`${apiPath}/api/p2p/offers`, {
      method: 'POST',
      body: {
        wallet_type,
        currency,
        amount,
        price,
        payment_method_id,
        min_amount,
        max_amount,
        chain,
      },
      credentials: 'include',
    })
  }

  const editP2POffer = async (uuid, min_amount, max_amount) => {
    return await $fetch(`${apiPath}/api/p2p/offers/edit/${uuid}`, {
      method: 'PUT',
      body: { min_amount, max_amount },
      credentials: 'include',
    })
  }

  const updateP2POffer = async (id, status) => {
    return await $fetch(`${apiPath}/api/p2p/offers/${id}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  return {
    getP2POffers,
    getP2POffer,
    getUserP2POffers,
    getUserP2POffer,
    createUserP2POffer,
    updateP2POffer,
    editP2POffer,
  }
}
