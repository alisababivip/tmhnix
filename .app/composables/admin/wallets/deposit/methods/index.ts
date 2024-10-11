import type { DepositMethod, JSONResponse } from '~~/types'

export default function useDepositMethods() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    createDepositMethod,
    updateDepositMethod,
    deleteDepositMethod,
    updateDepositMethodStatus,
  }

  async function createDepositMethod(
    depositMethodData: DepositMethod,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/deposit/methods`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: depositMethodData,
      },
    })
    return response
  }

  async function updateDepositMethod(
    id: number,
    depositMethodData: DepositMethod,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/deposit/methods/update/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          data: depositMethodData,
        },
      },
    )
    return response
  }

  async function deleteDepositMethod(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/deposit/methods/${id}`,
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

  async function updateDepositMethodStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/deposit/methods/update-status`,
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
