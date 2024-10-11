import type { JSONResponse } from '~~/types'

export default function useIcoToken() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getIcoTokens,
    getIcoToken,
  }

  async function getIcoTokens(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/tokens`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getIcoToken(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/tokens/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
