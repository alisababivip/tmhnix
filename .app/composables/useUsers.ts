import type { JSONResponse } from '~~/types'

// Composable to make user management tasks easier
export default function useUsers() {
  const apiPath = useRuntimeConfig().public.apiPath

  return {
    getUsers,
    fetchUsers,
    getUsersAnalytics,
    getUser,
    updateUser,
    deleteUser,
    deleteUsers,
    updateUsersStatus,
  }

  /**
   * @desc Get users
   * @returns {Promise<JSONResponse>}
   */
  async function getUsers(params = {}): Promise<JSONResponse> {
    return await $fetch(apiPath + '/api/admin/users', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      params,
    })
  }

  /**
   * @desc Fetch users
   * @returns {Promise<JSONResponse>}
   */
  async function fetchUsers(): Promise<JSONResponse> {
    return await $fetch(apiPath + '/api/admin/users/fetch/all', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  /**
   * @desc Get users analytics
   * @returns {Promise<JSONResponse>}
   */
  async function getUsersAnalytics(): Promise<JSONResponse> {
    return await $fetch(apiPath + '/api/admin/users/analytics/all', {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
  }

  /**
   * @desc Get user
   * @returns {Promise<JSONResponse>}
   */
  async function getUser(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/users/${uuid}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  /**
   * @desc Update a user
   * @param uuid User's uuid
   * @param values User record's editable values
   * @returns {Promise<JSONResponse>}
   */
  async function updateUser(
    uuid: string,
    first_name: string,
    last_name: string,
    email: string,
    role_id: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/users/${uuid}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        first_name,
        last_name,
        email,
        role_id,
      },
    })

    return response
  }

  /**
   * @desc Delete a user
   * @uuid User uuid
   * @returns {Promise<JSONResponse>}
   */
  async function deleteUser(uuid: string): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/users/${uuid}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  /**
   * @desc Delete users
   * @users User ids
   * @returns {Promise<JSONResponse>}
   */
  async function deleteUsers(users: number[]): Promise<JSONResponse> {
    const response = await $fetch(apiPath + '/api/admin/users/delete/bulk', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        users: users,
      },
    })

    return response
  }

  /**
   * @desc Update users status
   * @param users User ids
   * @param status Status to update
   * @returns {Promise<JSONResponse>}
   **/
  async function updateUsersStatus(
    users: number[],
    status: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + '/api/admin/users/update-status/bulk',
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          users: users,
          status: status,
        },
      },
    )

    return response
  }
}
