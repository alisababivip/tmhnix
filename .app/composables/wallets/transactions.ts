import type { JSONResponse } from '~~/types'

export default function useTransactions() {
  const apiPath = useRuntimeConfig().public.apiPath
  return { getAdminTransactions, getTransactions, getTransaction }

  async function getAdminTransactions(
    user?: string,
    type?: string,
    status?: string,
    wallet?: string,
    walletType?: string,
    basic: boolean = false,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/wallets/transactions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        user,
        type,
        status,
        wallet,
        walletType,
        basic,
      },
    })

    return response
  }

  async function getTransactions(
    type?: string,
    status?: string,
    wallet?: string,
    walletType?: string,
    basic: boolean = false,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/wallets/transactions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        type,
        status,
        wallet,
        walletType,
        basic,
      },
    })

    return response
  }

  async function getTransaction(referenceId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/wallets/transactions/${referenceId}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )

    return response
  }
}
