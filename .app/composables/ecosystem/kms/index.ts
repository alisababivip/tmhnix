import type { JSONResponse } from '~~/types'

// Composable to make ecosystem-related tasks easier for admins and users
export default function useEcosystemKMS() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    setEcosystemPassphrase,
  }

  async function setEcosystemPassphrase(
    passphrase: string,
  ): Promise<JSONResponse> {
    return await $fetch(`${apiPath}/api/admin/ecosystem/kms/set-passphrase`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: { passphrase },
    })
  }
}
