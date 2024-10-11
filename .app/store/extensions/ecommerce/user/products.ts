import type { EcommerceProduct } from '~~/types'

export const useUserEcommerceProductsStore = defineStore({
  id: 'userEcommerceProducts',

  state: () => ({
    products: [] as EcommerceProduct[],
    loading: false,
  }),

  getters: {
    getProductById: (state) => (id: number) =>
      state.products.find((product) => product.id === id),
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const { getUserProducts } = useEcommerce()
        const response = await getUserProducts()
        this.products = response.data.result
      } catch (error) {
        console.error('Error fetching user products:', error)
      }
      this.loading = false
    },
  },
})
