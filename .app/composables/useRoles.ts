import { H3Error } from 'h3'
import { ref } from 'vue'
import type { JSONResponse, Role } from '~~/types'

export default function useRoles() {
  const activeRole = ref<Role | null>(null)
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    activeRole,
    selectRole,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    deleteRoles,
    syncPermissions,
  }

  function selectRole(role: Role | null) {
    activeRole.value = role
  }

  async function getRoles(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/roles`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function getRole(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/roles/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function createRole(role: Role): Promise<JSONResponse | H3Error> {
    const response = await $fetch(apiPath + `/api/admin/roles`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        role: role,
      },
    })

    return response
  }

  async function updateRole(id: number, role: Role): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/roles/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        role: role,
      },
    })

    return response
  }

  async function deleteRole(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/roles/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function deleteRoles(ids: number[]): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/roles/bulk', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        ids: ids,
      },
    })

    return response
  }

  async function syncPermissions(
    id: number,
    permissionIds: number[],
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/roles/${id}/sync`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        permissionIds: permissionIds,
      },
    })

    return response
  }
}
