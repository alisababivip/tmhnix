import { defineStore } from 'pinia'
import type { EcommerceReview } from '~~/types'

export const useUserEcommerceReviewsStore = defineStore({
  id: 'userEcommerceReviews',

  state: () => ({
    reviews: [] as EcommerceReview[],
    loading: false,
  }),

  actions: {
    async fetchUserReviews(userId: number) {
      this.loading = true
      try {
        const { getUserReviews } = useEcommerce()
        const response = await getUserReviews(userId)
        this.reviews = response.data.result
      } catch (error) {
        console.error('Error fetching user reviews:', error)
      }
      this.loading = false
    },
    async addUserReview(review: EcommerceReview) {
      this.reviews.push(review)
    },
  },
})
