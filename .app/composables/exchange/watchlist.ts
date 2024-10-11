// import your JSONResponse type
import type { JSONResponse } from '~~/types'

export default function useWatchlist() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getWatchlists,
    createWatchlist,
    deleteWatchlist,
  }

  async function getWatchlists(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/watchlist`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createWatchlist(
    symbol: string,
    type: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/watchlist`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        symbol: symbol,
        type: type,
      },
    })
    return response
  }

  async function deleteWatchlist(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/watchlist/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
