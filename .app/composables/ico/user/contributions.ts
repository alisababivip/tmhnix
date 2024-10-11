import type { JSONResponse } from '~~/types'

export default function useIcoContribution() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getIcoContributions,
    getIcoContribution,
    createIcoContribution,
  }

  async function getIcoContributions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/contributions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getIcoContribution(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/contributions/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createIcoContribution(
    phase_id: number,
    amount: number,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/contributions`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        phase_id,
        amount,
      },
    })
    return response
  }
}
