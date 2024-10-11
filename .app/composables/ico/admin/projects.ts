import type { JSONResponse } from '~~/types'

export default function useAdminIcoProject() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAdminIcoProjects,
    getAdminIcoProject,
    createIcoProject,
    updateIcoProject,
    deleteIcoProject,
  }

  async function getAdminIcoProjects(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/projects`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getAdminIcoProject(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/projects/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function createIcoProject(
    name: string,
    description: string,
    website: string,
    whitepaper: string,
    image: string,
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        name: name,
        description: description,
        website: website,
        whitepaper: whitepaper,
        image: image,
        status: status,
      },
    })
    return response
  }

  async function updateIcoProject(
    id: number,
    name: string,
    description: string,
    website: string,
    whitepaper: string,
    image: string,
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/projects/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        name: name,
        description: description,
        website: website,
        whitepaper: whitepaper,
        image: image,
        status: status,
      },
    })
    return response
  }

  async function deleteIcoProject(id: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/ico/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
