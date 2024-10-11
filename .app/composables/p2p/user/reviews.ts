export default function useUserP2PReviews() {
  const apiPath = useRuntimeConfig().public.apiPath

  const createUserP2PReview = async (trade_id, rating, comment) => {
    return await $fetch(`${apiPath}/api/p2p/reviews/${trade_id}`, {
      method: 'POST',
      body: { rating, comment },
      credentials: 'include',
    })
  }

  return {
    createUserP2PReview,
  }
}
