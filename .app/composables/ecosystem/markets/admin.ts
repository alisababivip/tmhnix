import type { JSONResponse } from '~~/types'

export default function useAdminEcosystemMarkets() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminMarkets,
    getAdminMarket,
    createMarket,
    updateMarket,
    updateMarketsStatus,
    adminDeleteMarket,
    getOrdersByParams,
  }

  async function getAdminMarkets(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ecosystem/markets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminMarket(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ecosystem/markets/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )

    return response
  }

  async function createMarket(
    currency: string,
    pair: string,
    metadata: any,
    is_trending?: boolean,
    is_hot?: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ecosystem/markets`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        currency: currency,
        pair: pair,
        metadata: metadata,
        is_trending: is_trending || false,
        is_hot: is_hot || false,
      },
    })

    return response
  }
  async function updateMarket(
    id: number,
    metadata: any,
    is_trending?: boolean,
    is_hot?: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ecosystem/markets/${id}`,
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
      apiPath + `/api/admin/ecosystem/markets/status`,
      {
        method: 'POST',
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

  async function adminDeleteMarket(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ecosystem/markets/${id}`,
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

  async function getOrdersByParams(
    user?: string,
    symbol?: string,
    status?: string,
    side?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ecosystem/markets/log/orders`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        query: {
          user: user,
          symbol: symbol,
          status: status,
          side: side,
        },
      },
    )
    return response
  }
}
