import type { JSONResponse } from '~~/types'

export default function useAdminIcoAllocation() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminIcoAllocations,
    getAdminIcoAllocation,
    createIcoAllocation,
    updateIcoAllocation,
    deleteIcoAllocation,
  }

  async function getAdminIcoAllocations(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/allocations`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminIcoAllocation(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/allocations/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createIcoAllocation(
    token_id: number,
    name: string,
    percentage: number,
    phaseAllocations: { phase_id: number; percentage: number }[],
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/allocations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        name,
        percentage,
        token_id,
        phaseAllocations,
      },
    })
    return response
  }

  async function updateIcoAllocation(
    id: number,
    name: string,
    percentage: number,
    phaseAllocations: { phase_id: number; percentage: number }[],
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/allocations/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          name,
          percentage,
          phaseAllocations,
        },
      },
    )
    return response
  }

  async function deleteIcoAllocation(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/ico/allocations/${id}`,
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
}
