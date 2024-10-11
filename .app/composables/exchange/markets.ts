import type { ExchangeMarketMetaData, JSONResponse } from '~~/types'

export default function useMarkets() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getMarkets,
    getMarket,
    updateMarket,
    updateMarketsStatus,
    getTicker,
    getTickers,
    getOrderbook,
  }

  async function getMarkets(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/markets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getMarket(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/markets/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function getTicker(market: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/markets/${market}/ticker`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )

    return response
  }

  async function getOrderbook(
    market: string,
    limit: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/markets/${market}/orderbook`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        query: {
          limit: limit,
        },
      },
    )

    return response
  }

  async function getTickers(): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/markets/tickers/all`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )

    return response
  }

  async function updateMarket(
    id: number,
    metadata: ExchangeMarketMetaData,
    is_trending?: boolean,
    is_hot?: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/markets/update/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          metadata: metadata,
          is_trending: is_trending || false,
          is_hot: is_hot || false,
        },
      },
    )

    return response
  }

  async function updateMarketsStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/markets/update-status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          ids: ids,
          status: status,
        },
      },
    )
    return response
  }
}
