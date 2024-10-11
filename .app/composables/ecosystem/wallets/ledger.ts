import type { JSONResponse } from '~~/types'

// Composable to make ecosystem-related tasks easier for admins and users
export default function useEcosystemAdminLedgers() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getLedgers,
  }

  async function getLedgers(): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/admin/ecosystem/blockchains/ledgers`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }
}
