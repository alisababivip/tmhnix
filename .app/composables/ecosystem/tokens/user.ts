import type { JSONResponse } from '~~/types'

// Composable to make ecosystem-related tasks easier
export default function useEcosystemTokens() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getTokens,
    getToken,
  }

  async function getTokens(): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/tokens`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  async function getToken(currency: string): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/ecosystem/tokens/${currency}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }
}
