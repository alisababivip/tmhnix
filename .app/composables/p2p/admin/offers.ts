export default function useAdminP2POffers() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2POffers = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/offers`, {
      credentials: 'include',
    })
  }

  const getAdminP2POffer = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/offers/${id}`, {
      credentials: 'include',
    })
  }

  const updateAdminP2POffer = async (id, status) => {
    return await $fetch(`${apiPath}/api/admin/p2p/offers/${id}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  const deleteAdminP2POffer = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/offers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminP2POffers,
    getAdminP2POffer,
    updateAdminP2POffer,
    deleteAdminP2POffer,
  }
}
