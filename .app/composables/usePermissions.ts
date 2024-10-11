import { ref } from 'vue'
import type { JSONResponse, Permission } from '~~/types'

export default function usePermissions() {
  const activePermission = ref<Permission | null>(null)
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    activePermission,
    selectPermission,
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
  }

  function selectPermission(permission: Permission | null) {
    activePermission.value = permission
  }

  async function getPermissions(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/permissions`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function getPermission(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/permissions/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function createPermission(
    permission: Permission,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/permissions`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        permission: permission,
      },
    })

    return response
  }

  async function updatePermission(
    id: number,
    permission: Permission,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/permissions/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        permission: permission,
      },
    })

    return response
  }

  async function deletePermission(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/permissions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {},
    })

    return response
  }
}
