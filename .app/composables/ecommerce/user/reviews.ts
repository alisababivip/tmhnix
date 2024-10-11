export default function useUserReviews() {
  const apiPath = useRuntimeConfig().public.apiPath

  const createReview = async (
    productId: number,
    rating: number,
    comment: string,
  ) => {
    return await $fetch(`${apiPath}/api/ecommerce/reviews/${productId}`, {
      method: 'POST',
      body: { rating, comment },
      credentials: 'include',
    })
  }

  return {
    createReview,
  }
}
