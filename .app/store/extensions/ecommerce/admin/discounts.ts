import type { EcommerceDiscount } from '~~/types'

export const useAdminEcommerceDiscountsStore = defineStore({
  id: 'adminEcommerceDiscounts',

  state: () => ({
    discounts: [] as EcommerceDiscount[],
    loading: false,
    selectedDiscount: null as EcommerceDiscount | null,
  }),

  getters: {
    getDiscountById: (state) => (id: number) =>
      state.discounts.find((discount) => discount.id === id),
  },

  actions: {
    async fetchDiscounts() {
      this.loading = true
      try {
        const { getAdminDiscounts } = useEcommerce()
        const response = await getAdminDiscounts()
        this.discounts = response.data.result
      } catch (error) {
        console.error('Error fetching admin discounts:', error)
      }
      this.loading = false
    },
    async addDiscount(discount: EcommerceDiscount) {
      this.discounts.push(discount)
    },
    async updateDiscount(updatedDiscount: EcommerceDiscount) {
      const index = this.discounts.findIndex(
        (discount) => discount.id === updatedDiscount.id,
      )
      if (index !== -1) {
        this.discounts[index] = updatedDiscount
      }
    },
    async removeDiscount(id: number) {
      const index = this.discounts.findIndex((discount) => discount.id === id)
      if (index !== -1) {
        this.discounts.splice(index, 1)
      }
    },
    async selectDiscount(discount: EcommerceDiscount) {
      this.selectedDiscount = discount
    },
    async selectDiscountById(id: number) {
      this.selectedDiscount = this.getDiscountById(id) || null
    },
  },
})
