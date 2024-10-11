import type { EcommerceProduct } from '~~/types'

export const useAdminEcommerceProductsStore = defineStore({
  id: 'adminEcommerceProducts',

  state: () => ({
    products: [] as EcommerceProduct[],
    loading: false,
    selectedProduct: null as EcommerceProduct | null,
  }),

  getters: {
    getProductById: (state) => (id: number) =>
      state.products.find((product) => product.id === id),
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const { getAdminProducts } = useEcommerce()
        const response = await getAdminProducts()
        this.products = response.data.result
      } catch (error) {
        console.error('Error fetching admin products:', error)
      }
      this.loading = false
    },
    async addProduct(product: EcommerceProduct) {
      this.products.push(product)
    },
    async updateProduct(updatedProduct: EcommerceProduct) {
      const index = this.products.findIndex(
        (product) => product.id === updatedProduct.id,
      )
      if (index !== -1) {
        this.products[index] = updatedProduct
      }
    },
    async removeProduct(id: number) {
      const index = this.products.findIndex((product) => product.id === id)
      if (index !== -1) {
        this.products.splice(index, 1)
      }
    },
    async selectProduct(product: EcommerceProduct) {
      this.selectedProduct = product
    },
    async selectProductById(id: number) {
      this.selectedProduct = this.getProductById(id)
    },
  },
})
