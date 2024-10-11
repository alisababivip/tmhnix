import type { EcommerceDiscount } from '~~/types'

export const useUserEcommerceDiscountsStore = defineStore({
  id: 'userEcommerceDiscounts',

  state: () => ({
    availableDiscounts: [] as EcommerceDiscount[],
    loading: false,
  }),

  actions: {
    async fetchAvailableDiscounts() {
      this.loading = true
      try {
        const { getUserDiscounts } = useEcommerce()
        const response = await getUserDiscounts()
        this.availableDiscounts = response.data.result
      } catch (error) {
        console.error('Error fetching available discounts for user:', error)
      }
      this.loading = false
    },
  },
})
