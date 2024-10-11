import type { JSONResponse } from '~~/types'

export default function useForex() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getForexAccount,
    getForexAccounts,
    getForexInvestments,
    getForexActiveInvestment,
    getForexInvestment,
    storeDepositTransaction,
    storeWithdrawTransaction,
    createInvestment,
    cancelInvestment,
  }

  async function getForexAccount(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/account/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexAccounts(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/account`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexInvestments(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/investments`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexActiveInvestment(): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/forex/investments/active/investment`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function getForexInvestment(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/investments/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function storeDepositTransaction(
    accountId: string,
    walletUuid: string,
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/forex/account/${accountId}/deposit`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: { walletUuid, amount },
      },
    )
    return response
  }

  async function storeWithdrawTransaction(
    accountId: string,
    currency: string,
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/forex/account/${accountId}/withdraw`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: { currency, amount },
      },
    )
    return response
  }

  async function createInvestment(
    accountId: string,
    planId: number,
    durationId: number,
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/investments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: { accountId, planId, durationId, amount },
    })
    return response
  }

  async function cancelInvestment(investmentId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/forex/investments/${investmentId}/cancel`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
