import type { JSONResponse } from '~~/types'

export default function useUserInvestment() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getInvestments,
    getInvestment,
    getUserInvestment,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    cancelInvestment,
  }

  async function getInvestments(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getInvestment(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment/uuid/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getUserInvestment(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment/user`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createInvestment(
    plan: number,
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        plan: plan,
        amount: amount,
      },
    })
    return response
  }

  async function updateInvestment(
    id: string,
    data: any,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: data,
    })
    return response
  }

  async function deleteInvestment(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function cancelInvestment(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/investment/${uuid}/cancel`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
