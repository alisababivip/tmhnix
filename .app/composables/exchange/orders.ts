import type { JSONResponse } from '~~/types'

export default function useOrders() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getOrders,
    getOrder,
    createOrder,
    cancelOrder,
    checkOrder,
  }

  async function getOrders(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/orders`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getOrder(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/orders/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
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
    const response = await $fetch(apiPath + `/api/exchange/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        symbol,
        type,
        side,
        amount,
        price,
      },
    })

    return response
  }

  async function cancelOrder(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/exchange/orders/${uuid}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function checkOrder(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/exchange/orders/${uuid}/status`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )

    return response
  }
}
