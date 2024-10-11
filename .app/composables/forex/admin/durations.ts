import type { ForexDuration, JSONResponse } from '~~/types'

export default function useAdminForexDuration() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getForexDurations,
    getForexDuration,
    createForexDuration,
    updateForexDuration,
    deleteForexDuration,
  }

  async function getForexDurations(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/durations`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexDuration(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/durations/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createForexDuration(
    duration: ForexDuration,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/durations`, {
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

  async function updateForexDuration(
    id: number,
    duration: ForexDuration,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/durations/${id}`,
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

  async function deleteForexDuration(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/forex/durations/${id}`,
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
