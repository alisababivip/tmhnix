import type { JSONResponse } from '~~/types'

export default function useIcoProject() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getIcoProjects,
    getIcoProject,
  }

  async function getIcoProjects(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/projects`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getIcoProject(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/ico/projects/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
