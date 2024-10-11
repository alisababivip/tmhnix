import type { JSONResponse } from '~~/types'

export default function useAdminIcoContribution() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getIcoAnalytics,
  }

  async function getIcoAnalytics(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
