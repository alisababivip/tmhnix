import type { EcommerceReview } from '~~/types'

export const useAdminEcommerceReviewsStore = defineStore({
  id: 'adminEcommerceReviews',

  state: () => ({
    reviews: [] as EcommerceReview[],
    loading: false,
    selectedReview: null as EcommerceReview | null,
  }),

  getters: {
    getReviewById: (state) => (id: number) =>
      state.reviews.find((review) => review.id === id),
  },

  actions: {
    async fetchReviews() {
      this.loading = true
      try {
        const { getAdminReviews } = useEcommerce()
        const response = await getAdminReviews()
        this.reviews = response.data.result
      } catch (error) {
        console.error('Error fetching admin reviews:', error)
      }
      this.loading = false
    },
    async addReview(review: EcommerceReview) {
      this.reviews.push(review)
    },
    async updateReview(updatedReview: EcommerceReview) {
      const index = this.reviews.findIndex(
        (review) => review.id === updatedReview.id,
      )
      if (index !== -1) {
        this.reviews[index] = updatedReview
      }
    },
    async removeReview(id: number) {
      const index = this.reviews.findIndex((review) => review.id === id)
      if (index !== -1) {
        this.reviews.splice(index, 1)
      }
    },
    async selectReview(review: EcommerceReview) {
      this.selectedReview = review
    },
    async selectReviewById(id: number) {
      this.selectedReview = this.getReviewById(id) || null
    },
  },
})
