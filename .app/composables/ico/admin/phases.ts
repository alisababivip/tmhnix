import type { JSONResponse } from '~~/types'

export default function useAdminIcoPhase() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminIcoPhases,
    getAdminIcoPhase,
    createIcoPhase,
    updateIcoPhase,
    deleteIcoPhase,
  }

  async function getAdminIcoPhases(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/phases`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminIcoPhase(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/phases/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createIcoPhase(
    tokenId: number,
    name: string,
    price: number,
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    startDate: string,
    endDate: string,
    min_purchase: number,
    max_purchase: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/phases`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        name: name,
        price: price,
        status: status,
        start_date: startDate,
        end_date: endDate,
        token_id: tokenId,
        min_purchase: min_purchase,
        max_purchase: max_purchase,
      },
    })
    return response
  }

  async function updateIcoPhase(
    id: number,
    tokenId: number,
    name: string,
    price: number,
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    startDate: string,
    endDate: string,
    min_purchase: number,
    max_purchase: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/phases/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        name: name,
        price: price,
        status: status,
        start_date: startDate,
        end_date: endDate,
        token_id: tokenId,
        min_purchase: min_purchase,
        max_purchase: max_purchase,
      },
    })
    return response
  }

  async function deleteIcoPhase(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/phases/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
