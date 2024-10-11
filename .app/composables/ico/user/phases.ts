import type { JSONResponse } from '~~/types'

export default function useIcoPhase() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getIcoPhases,
    getIcoPhase,
  }

  async function getIcoPhases(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/phases`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getIcoPhase(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/phases/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
