import type { JSONResponse } from '~~/types'

export default function useOrders() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getOrdersByParams,
  }

  async function getOrdersByParams(
    user: string,
    type: string,
    status: string,
    side: string,
    currency: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/exchange/orders`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        user: user,
        type: type,
        status: status,
        side: side,
        currency: currency,
      },
    })
    return response
  }
}
