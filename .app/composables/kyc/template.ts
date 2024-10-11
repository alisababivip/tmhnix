import type { JSONResponse, KycTemplate } from '~~/types'

export default function useKycTemplate() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getKycTemplates,
    getActiveKycTemplate,
    getKycTemplate,
    createKycTemplate,
    updateKycTemplate,
    deleteKycTemplate,
    updateKycTemplateStatus,
  }

  async function getKycTemplates(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc-template`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getActiveKycTemplate(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/kyc-template`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getKycTemplate(id: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/kyc-template/id/${id}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createKycTemplate(
    kycTemplate: KycTemplate,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc-template`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: kycTemplate,
      },
    })
    return response
  }

  async function updateKycTemplate(
    id: string,
    updatedTemplate: Partial<KycTemplate>,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc-template/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        data: updatedTemplate,
      },
    })
    return response
  }

  async function deleteKycTemplate(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/kyc-template/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function updateKycTemplateStatus(
    ids: number[],
    status: boolean,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/kyc-template/update-status`,
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
