import type { JSONResponse, Kyc } from '~~/types'

export default function useKycs() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getKycs,
    getKyc,
    getUserKyc,
    createKyc,
    updateKyc,
    deleteKyc,
    updateKycStatus,
  }

  async function getKycs(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getKyc(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function deleteKyc(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function updateKycStatus(
    id: string,
    status: string,
    message?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        status: status,
        message: message,
      },
    })
    return response
  }

  async function getUserKyc(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/kyc`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createKyc(
    templateId: number,
    kycData: Kyc,
    level: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/kyc`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        templateId: templateId,
        template: kycData,
        level: level,
      },
    })
    return response
  }

  async function updateKyc(
    id: string,
    updatedData: Partial<Kyc>,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/kyc/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: updatedData,
    })
    return response
  }
}
