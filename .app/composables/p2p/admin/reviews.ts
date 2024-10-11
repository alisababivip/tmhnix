export default function useAdminP2PReviews() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2PReviews = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/reviews`, {
      credentials: 'include',
    })
  }

  const getAdminP2PReview = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/reviews/${id}`, {
      credentials: 'include',
    })
  }

  const deleteAdminP2PReview = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/reviews/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminP2PReviews,
    getAdminP2PReview,
    deleteAdminP2PReview,
  }
}
