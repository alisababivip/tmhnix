import type { P2PReview } from '~~/types'

export const useAdminP2PReviewsStore = defineStore({
  id: 'adminP2PReviews',

  state: () => ({
    reviews: [] as P2PReview[],
    loading: false,
    selectedReview: null as P2PReview | null,
  }),

  getters: {
    getReviewById: (state) => (id: number) =>
      state.reviews.find((review) => review.id === id),
  },

  actions: {
    async fetchP2PReviews() {
      this.loading = true
      try {
        const { getAdminP2PReviews } = useP2P()
        const response = await getAdminP2PReviews()
        this.reviews = response.data.result
      } catch (error) {
        console.error('Error fetching P2P reviews:', error)
      }
      this.loading = false
    },
    async removeReview(id: number) {
      const index = this.reviews.findIndex((review) => review.id === id)
      if (index !== -1) this.reviews.splice(index, 1)
    },
    async selectReview(review: P2PReview) {
      this.selectedReview = review
    },
    async selectReviewById(id: number) {
      this.selectedReview = this.getReviewById(id)
    },
  },
})
