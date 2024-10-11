import type { JSONResponse } from '~~/types'

export default function useAdminAITrading() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminAITradings,
    getAdminAITrading,
    updateAITrading,
    deleteAITrading,
    updateAITradingStatus,
    getAdminAiTradingAnalytics,
  }

  async function getAdminAITradings(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminAITrading(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function updateAITrading(
    uuid: string,
    result: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
    profit: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/${uuid}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        result: result,
        profit: profit,
      },
    })
    return response
  }

  async function deleteAITrading(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/${uuid}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function updateAITradingStatus(
    uuids: string[],
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/update-status`,
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

  async function getAdminAiTradingAnalytics(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/analytics`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
