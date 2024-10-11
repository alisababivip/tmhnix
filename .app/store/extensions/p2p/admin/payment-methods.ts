import type { P2PPaymentMethod } from '~~/types'

export const useAdminPaymentMethodsStore = defineStore({
  id: 'adminPaymentMethods',

  state: () => ({
    methods: [] as P2PPaymentMethod[],
    loading: false,
    selectedPaymentMethod: null as P2PPaymentMethod | null,
  }),

  getters: {
    getPaymentMethodById: (state) => (id: number) =>
      state.methods.find((method) => method.id === id),
  },

  actions: {
    async fetchPaymentMethods() {
      this.loading = true
      try {
        const { getAdminPaymentMethods } = useP2P()
        const response = await getAdminPaymentMethods()
        this.methods = response.data.result
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      }
      this.loading = false
    },
    async removePaymentMethod(id: number) {
      const index = this.methods.findIndex((method) => method.id === id)
      if (index !== -1) this.methods.splice(index, 1)
    },
    async selectPaymentMethod(method: P2PPaymentMethod) {
      this.selectedPaymentMethod = method
    },
    async selectPaymentMethodById(id: number) {
      this.selectedPaymentMethod = this.getPaymentMethodById(id)
    },
  },
})
