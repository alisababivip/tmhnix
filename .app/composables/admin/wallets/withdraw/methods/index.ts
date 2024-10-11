import type { JSONResponse, WithdrawMethod } from '~~/types'

export default function useWithdrawMethods() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    createWithdrawMethod,
    updateWithdrawMethod,
    deleteWithdrawMethod,
    updateWithdrawMethodStatus,
  }

  async function createWithdrawMethod(
    withdrawMethodData: WithdrawMethod,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/withdraw/methods`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: withdrawMethodData,
      },
    })
    return response
  }

  async function updateWithdrawMethod(
    id: number,
    withdrawMethodData: WithdrawMethod,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/withdraw/methods/update/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          data: withdrawMethodData,
        },
      },
    )
    return response
  }

  async function deleteWithdrawMethod(id: number): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/withdraw/methods/${id}`,
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

  async function updateWithdrawMethodStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/withdraw/methods/update-status`,
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
