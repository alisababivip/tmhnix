import type { JSONResponse } from '~~/types'

export default function useAdminIcoContribution() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminIcoContributions,
    getAdminIcoContribution,
    updateIcoContribution,
    deleteIcoContribution,
    payIcoContribution,
  }

  async function getAdminIcoContributions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/contributions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminIcoContribution(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/contributions/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function updateIcoContribution(
    id: number,
    result: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
    profit: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/contributions/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          result: result,
          profit: profit,
        },
      },
    )
    return response
  }

  async function deleteIcoContribution(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/contributions/${id}`,
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

  async function payIcoContribution(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/contributions/${id}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
