import type { EcommerceProduct } from '~~/types'

export const useUserEcommerceWishlistStore = defineStore({
  id: 'userEcommerceWishlist',

  state: () => ({
    wishlist: [] as EcommerceProduct[],
    loading: false,
  }),

  actions: {
    async fetchWishlist(userId: number) {
      this.loading = true
      try {
        const { getUserWishlist } = useEcommerce()
        const response = await getUserWishlist(userId)
        this.wishlist = response.data.result
      } catch (error) {
        console.error('Error fetching user wishlist:', error)
      }
      this.loading = false
    },
    async addToWishlist(product: EcommerceProduct) {
      const existingItem = this.wishlist.find((item) => item.id === product.id)
      if (!existingItem) {
        this.wishlist.push(product)
      }
    },
    async removeFromWishlist(productId: number) {
      this.wishlist = this.wishlist.filter((item) => item.id !== productId)
    },
  },
})
