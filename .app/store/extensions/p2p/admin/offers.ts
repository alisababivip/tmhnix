import type { P2POffer } from '~~/types'

export const useAdminP2POffersStore = defineStore({
  id: 'adminP2POffers',

  state: () => ({
    offers: [] as P2POffer[],
    loading: false,
    selectedOffer: null as P2POffer | null,
  }),

  getters: {
    getOfferById: (state) => (id: number) =>
      state.offers.find((offer) => offer.id === id),
  },

  actions: {
    async fetchP2POffers() {
      this.loading = true
      try {
        const { getAdminP2POffers } = useP2P()
        const response = await getAdminP2POffers()
        this.offers = response.data.result
      } catch (error) {
        console.error('Error fetching P2P offers:', error)
      }
      this.loading = false
    },
    async removeOffer(id: number) {
      const index = this.offers.findIndex((offer) => offer.id === id)
      if (index !== -1) this.offers.splice(index, 1)
    },
    async selectOffer(offer: P2POffer) {
      this.selectedOffer = offer
    },
    async selectOfferById(id: number) {
      this.selectedOffer = this.getOfferById(id)
    },
  },
})
