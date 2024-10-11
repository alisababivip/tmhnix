export default function useAdminReviews() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminReviews = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/reviews`, {
      credentials: 'include',
    })
  }

  const getAdminReview = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/reviews/${id}`, {
      credentials: 'include',
    })
  }

  const updateAdminReview = async (
    id: number,
    rating: number,
    comment: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/reviews/${id}`, {
      method: 'PUT',
      body: { rating, comment },
      credentials: 'include',
    })
  }

  const deleteAdminReview = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/reviews/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminReviews,
    getAdminReview,
    updateAdminReview,
    deleteAdminReview,
  }
}
