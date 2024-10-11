import type { DepositGateway, JSONResponse } from '~~/types'

export default function useDepositGateways() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    updateDepositGateway,
    updateDepositGatewayStatus,
  }

  async function updateDepositGateway(
    id: number,
    depositGatewayData: DepositGateway,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/deposit/gateways/update/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          data: depositGatewayData,
        },
      },
    )
    return response
  }
  async function updateDepositGatewayStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/deposit/gateways/update-status`,
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
