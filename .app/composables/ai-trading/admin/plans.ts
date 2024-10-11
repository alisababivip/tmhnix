import type { AITradingPlan, JSONResponse } from '~~/types'

export default function useAdminAITradingPlan() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminAITradingPlans,
    getAdminAITradingPlan,
    createAITradingPlan,
    updateAITradingPlan,
    deleteAITradingPlan,
    updateAITradingPlanStatus,
  }

  async function getAdminAITradingPlans(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/plans`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminAITradingPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/plans/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createAITradingPlan(
    plan: AITradingPlan,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ai-trading/plans`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        plan: plan,
      },
    })
    return response
  }

  async function updateAITradingPlan(
    id: string,
    plan: AITradingPlan,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/plans/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          plan: plan,
        },
      },
    )
    return response
  }

  async function deleteAITradingPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/plans/${id}`,
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

  async function updateAITradingPlanStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ai-trading/plans/update-status`,
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
