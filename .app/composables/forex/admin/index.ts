import type { JSONResponse } from '~~/types'

export default function useAdminForex() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getForexAnalytics,
    getForexTransaction,
    getForexTransactions,
    getAdminForexAccounts,
    createAdminForexAccount,
    updateAdminForexAccount,
    getAdminForexInvestments,
    getAdminForexInvestment,
    updateForexInvestment,
    deleteForexInvestment,
    updateForexInvestmentStatus,
    updateTransactionStatus,
  }

  async function getForexAnalytics(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function updateTransactionStatus(
    uuid: string,
    status: string,
    message?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/transactions/${uuid}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          status: status,
          message: message,
        },
      },
    )
    return response
  }

  async function getForexTransaction(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/transactions/${uuid}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function getForexTransactions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/transactions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminForexAccounts(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/accounts`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createAdminForexAccount(
    account_id: string,
    broker: string,
    password: string,
    mt: number,
    type: 'LIVE' | 'DEMO',
    status: boolean,
    balance: number,
    leverage: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/accounts`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        account_id: account_id,
        broker: broker,
        password: password,
        mt: mt,
        type: type,
        status: status,
        balance: balance,
        leverage: leverage,
      },
    })
    return response
  }

  async function updateAdminForexAccount(
    id: number,
    account_id: string,
    broker: string,
    password: string,
    mt: number,
    type: 'LIVE' | 'DEMO',
    status: boolean,
    balance: number,
    leverage: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/accounts/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        account_id: account_id,
        broker: broker,
        password: password,
        mt: mt,
        type: type,
        status: status,
        balance: balance,
        leverage: leverage,
      },
    })
    return response
  }

  async function getAdminForexInvestments(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/investments`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminForexInvestment(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/investments/${uuid}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function updateForexInvestment(
    uuid: string,
    result: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
    profit: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/investments/${uuid}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          result: result,
          profit: profit,
        },
      },
    )
    return response
  }

  async function deleteForexInvestment(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/investments/${uuid}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function updateForexInvestmentStatus(
    uuids: string[],
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/investments/update-status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          uuids: uuids,
          status: status,
        },
      },
    )
    return response
  }
}
