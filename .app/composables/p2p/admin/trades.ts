export default function useAdminP2PTrades() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2PTrades = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/trades`, {
      credentials: 'include',
    })
  }

  const getAdminP2PTrade = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/trades/${id}`, {
      credentials: 'include',
    })
  }

  const updateAdminP2PTrade = async (id, status) => {
    return await $fetch(`${apiPath}/api/admin/p2p/trades/${id}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  const cancelAdminP2PTrade = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/trades/${id}/cancel`, {
      method: 'PUT',
      credentials: 'include',
    })
  }

  const completeAdminP2PTrade = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/trades/${id}/complete`, {
      method: 'PUT',
      credentials: 'include',
    })
  }

  return {
    getAdminP2PTrades,
    getAdminP2PTrade,
    updateAdminP2PTrade,
    cancelAdminP2PTrade,
    completeAdminP2PTrade,
  }
}
