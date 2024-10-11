import type { EcommerceOrder } from '~~/types'

export const useAdminEcommerceOrdersStore = defineStore({
  id: 'adminEcommerceOrders',

  state: () => ({
    orders: [] as EcommerceOrder[],
    loading: false,
    selectedOrder: null as EcommerceOrder | null,
  }),

  getters: {
    getOrderById: (state) => (id: number) =>
      state.orders.find((order) => order.id === id),
  },

  actions: {
    async fetchOrders() {
      this.loading = true
      try {
        const { getAdminOrders } = useEcommerce()
        const response = await getAdminOrders()
        this.orders = response.data.result
      } catch (error) {
        console.error('Error fetching admin orders:', error)
      }
      this.loading = false
    },
    async updateOrder(updatedOrder: EcommerceOrder) {
      const index = this.orders.findIndex(
        (order) => order.id === updatedOrder.id,
      )
      if (index !== -1) {
        this.orders[index] = updatedOrder
      }
    },
    async removeOrder(id: number) {
      const index = this.orders.findIndex((order) => order.id === id)
      if (index !== -1) {
        this.orders.splice(index, 1)
      }
    },
    async selectOrder(order: EcommerceOrder) {
      this.selectedOrder = order
    },
    async selectOrderById(id: number) {
      this.selectedOrder = this.getOrderById(id) || null
    },
  },
})
