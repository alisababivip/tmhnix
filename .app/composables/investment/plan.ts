import type { InvestmentPlan, JSONResponse } from '~~/types'

export default function useAdminInvestment() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getInvestmentPlans,
    getInvestmentPlan,
    getAdminInvestmentPlans,
    getAdminInvestmentPlan,
    createInvestmentPlan,
    updateInvestmentPlan,
    deleteInvestmentPlan,
    updateInvestmentPlanStatus,
  }

  async function getInvestmentPlans(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment-plan`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getInvestmentPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment-plan/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminInvestmentPlans(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/investment-plan`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminInvestmentPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/investment-plan/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createInvestmentPlan(
    plan: InvestmentPlan,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/investment-plan`, {
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

  async function updateInvestmentPlan(
    id: string,
    plan: InvestmentPlan,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/investment-plan/${id}`,
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

  async function deleteInvestmentPlan(id: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/investment-plan/${id}`,
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

  async function updateInvestmentPlanStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/investment-plan/update-status`,
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
