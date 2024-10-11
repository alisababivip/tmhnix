import type { ForexSignal, JSONResponse } from '~~/types'

export default function useAdminForexSignal() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getForexSignals,
    getForexSignal,
    createForexSignal,
    updateForexSignal,
    deleteForexSignal,
  }

  async function getForexSignals(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/signals`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexSignal(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/signals/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createForexSignal(
    title: string,
    image: string,
    status: ForexSignalStatus,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/signals`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        title: title,
        image: image,
        status: status,
      },
    })
    return response
  }

  async function updateForexSignal(
    id: number,
    title: string,
    image: string,
    status: ForexSignalStatus,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/signals/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        title: title,
        image: image,
        status: status,
      },
    })
    return response
  }

  async function deleteForexSignal(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/forex/signals/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
