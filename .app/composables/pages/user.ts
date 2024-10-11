import type { JSONResponse } from '~~/types'

export default function useUserPage() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getPages,
    getPage,
  }

  async function getPages(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/pages`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getPage(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/pages/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
