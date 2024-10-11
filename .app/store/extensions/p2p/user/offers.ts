import type { P2POffer } from '~~/types'

export const useUserP2POffersStore = defineStore({
  id: 'userP2POffers',

  state: () => ({
    offers: [] as P2POffer[],
    userOffers: [] as P2POffer[],
    loading: false,
    selectedOffer: null as P2POffer | null,
  }),

  getters: {
    getOfferById: (state) => (id: number) =>
      state.offers.find((offer) => offer.id === id),
    getOfferByUuid: (state) => (uuid: string) =>
      state.offers.find((offer) => offer.uuid === uuid),
  },

  actions: {
    async fetchP2POffers() {
      this.loading = true
      try {
        const { getP2POffers } = useP2P()
        const response = await getP2POffers()
        this.offers = response.data.result
      } catch (error) {
        console.error('Error fetching P2P offers:', error)
      }
      this.loading = false
    },
    async fetchUserP2POffers() {
      this.loading = true
      try {
        const { getUserP2POffers } = useP2P()
        const response = await getUserP2POffers()
        this.userOffers = response.data.result
      } catch (error) {
        console.error('Error fetching P2P offers:', error)
      }
      this.loading = false
    },
    async selectOfferById(id: number) {
      this.selectedOffer = this.getOfferById(id)
    },
    async selectOfferByUuid(uuid: string) {
      this.selectedOffer =
        this.offers.find((offer) => offer.uuid === uuid) || null
    },
    async removeOfferById(id: number) {
      this.offers = this.offers.filter((offer) => offer.id !== id)
    },
  },
})
