import type { JSONResponse } from '~~/types'

export default function useAITradingPlan() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAITradingPlans,
    getAITradingPlan,
  }

  async function getAITradingPlans(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading/plans`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAITradingPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ai-trading/plans/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
