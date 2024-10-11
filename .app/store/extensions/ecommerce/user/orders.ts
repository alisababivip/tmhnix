import type { EcommerceOrder } from '~~/types'

export const useUserEcommerceOrdersStore = defineStore({
  id: 'userEcommerceOrders',

  state: () => ({
    orders: [] as EcommerceOrder[],
    loading: false,
  }),

  getters: {
    getOrderById: (state) => (id: number) =>
      state.orders.find((order) => order.id === id),
  },

  actions: {
    async fetchOrders() {
      this.loading = true
      try {
        const { getUserOrders } = useEcommerce()
        const response = await getUserOrders()
        this.orders = response.data.result
      } catch (error) {
        console.error('Error fetching user orders:', error)
      }
      this.loading = false
    },
  },
})
