import type { JSONResponse, Wallet } from '~~/types'

export default function useWallets() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    adminGetWallets,
    adminGetWallet,
    updateWallet,
    updateBalance,
  }

  async function adminGetWallets(params = {}): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/wallets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      params,
    })

    return response
  }

  async function adminGetWallet(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/wallets/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function updateWallet(
    uuid: string,
    wallet: Wallet,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/wallets/fiat`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        user: uuid,
        uuid: wallet,
      },
    })

    return response
  }

  async function updateBalance(
    uuid: string,
    type: 'ADD' | 'SUBTRACT',
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/wallets/update-balance',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          uuid: uuid,
          type: type,
          amount: amount,
        },
      },
    )

    return response
  }
}
