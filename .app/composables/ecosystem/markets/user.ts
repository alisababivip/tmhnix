import type { JSONResponse } from '~~/types'

export default function useEcosystemMarkets() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getMarkets,
    getMarket,
  }

  async function getMarkets(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/markets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getMarket(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/markets/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }
}
