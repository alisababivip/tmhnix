import type { JSONResponse } from '~~/types'

export default function useForexPlan() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getForexPlans,
    getForexPlan,
  }

  async function getForexPlans(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/plans`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getForexPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/forex/plans/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
