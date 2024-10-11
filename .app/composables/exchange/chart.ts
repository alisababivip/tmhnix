import type { JSONResponse } from '~~/types'

export default function useChart() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getHistorical,
  }

  async function getHistorical(
    symbol: any,
    interval: any,
    from: any,
    to: number,
    duration: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/chart/historical`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        symbol: symbol,
        interval: interval,
        from: from,
        to: to,
        duration: duration,
      },
    })
    return response
  }
}
