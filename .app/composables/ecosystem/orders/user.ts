import type { JSONResponse } from '~~/types'

export default function useEcosystemOrders() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getOrders,
    createOrder,
    cancelOrder,
    getHistorical,
    getTicker,
  }

  async function getOrders(symbol: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/orders`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        symbol,
      },
    })
    return response
  }

  async function createOrder(
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        symbol,
        amount,
        price,
        type,
        side,
      },
    })

    return response
  }

  async function cancelOrder(uuid: string, created_at): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/orders/${uuid}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        created_at,
      },
    })

    return response
  }

  async function getHistorical(
    symbol: any,
    from: any,
    to: number,
    interval: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/ecosystem/orders/chart/historical`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        query: {
          symbol,
          from,
          to,
          interval,
        },
      },
    )
    return response
  }

  async function getTicker(symbol: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ecosystem/orders/ticker`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        symbol,
      },
    })
    return response
  }
}
