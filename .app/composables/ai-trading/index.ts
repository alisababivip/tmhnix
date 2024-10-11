import type { JSONResponse } from '~~/types'

export default function useAITrading() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAITradings,
    getActiveAITradings,
    getAITrading,
    createOrder,
  }

  async function getAITradings(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getActiveAITradings(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading/fetch/active`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createOrder(
    plan_id: number,
    duration: number,
    amount: number,
    currency: string,
    pair: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        plan_id: plan_id,
        duration: duration,
        amount: amount,
        currency: currency,
        pair: pair,
      },
    })
    return response
  }

  async function getAITrading(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
