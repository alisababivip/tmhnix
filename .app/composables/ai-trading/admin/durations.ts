import type { AITradingDuration, JSONResponse } from '~~/types'

export default function useAdminAITradingDuration() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAITradingDurations,
    getAITradingDuration,
    createAITradingDuration,
    updateAITradingDuration,
    deleteAITradingDuration,
  }

  async function getAITradingDurations(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/durations`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAITradingDuration(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/durations/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createAITradingDuration(
    duration: AITradingDuration,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/durations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        duration: duration,
      },
    })
    return response
  }

  async function updateAITradingDuration(
    id: number,
    duration: AITradingDuration,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/durations/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          duration: duration,
        },
      },
    )
    return response
  }

  async function deleteAITradingDuration(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/durations/${id}`,
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
}
