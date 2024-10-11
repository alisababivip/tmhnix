import type { IcoTokenStatus, JSONResponse } from '~~/types'

export default function useAdminIcoToken() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminIcoTokens,
    getAdminIcoToken,
    createIcoToken,
    updateIcoToken,
    deleteIcoToken,
  }

  async function getAdminIcoTokens(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/tokens`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminIcoToken(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/tokens/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createIcoToken(
    project_id: number,
    name: string,
    chain: string,
    currency: string,
    purchase_currency: string,
    purchase_wallet_type: string,
    address: string,
    total_supply: number,
    description: string,
    image: string,
    status: IcoTokenStatus,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/tokens`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        project_id,
        name,
        chain,
        currency,
        purchase_currency,
        purchase_wallet_type,
        address,
        total_supply,
        description,
        image,
        status,
      },
    })
    return response
  }

  async function updateIcoToken(
    id: number,
    project_id: number,
    name: string,
    chain: string,
    currency: string,
    purchase_currency: string,
    purchase_wallet_type: string,
    address: string,
    total_supply: number,
    description: string,
    image: string,
    status: IcoTokenStatus,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/tokens/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        project_id,
        name,
        chain,
        currency,
        purchase_currency,
        purchase_wallet_type,
        address,
        total_supply,
        description,
        image,
        status,
      },
    })
    return response
  }

  async function deleteIcoToken(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/tokens/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
