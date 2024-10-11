import type { JSONResponse, Page } from '~~/types'

export default function useAdminPage() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    createPage,
    updatePage,
    deletePage,
  }

  async function createPage(page: Page): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/pages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: { data: page },
    })
    return response
  }

  async function updatePage(id: number, page: Page): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/pages/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: { data: page },
    })
    return response
  }

  async function deletePage(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/pages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
