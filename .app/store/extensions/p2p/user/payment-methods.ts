import type { P2PPaymentMethod } from '~~/types'

export const useUserPaymentMethodsStore = defineStore({
  id: 'userPaymentMethods',

  state: () => ({
    methods: [] as P2PPaymentMethod[],
    loading: false,
    selectedMethod: null as P2PPaymentMethod | null,
  }),

  getters: {
    getPaymentMethodById: (state) => (id: string) =>
      state.methods.find((method) => method.id === id),
  },

  actions: {
    async fetchPaymentMethods() {
      this.loading = true
      try {
        const { getUserPaymentMethods } = useP2P()
        const response = await getUserPaymentMethods()
        this.methods = response.data.result
      } catch (error) {
        console.error('Error fetching user payment methods:', error)
      }
      this.loading = false
    },
    async selectPaymentMethodById(id: string) {
      this.selectedMethod = this.methods.find((method) => method.id === id)
    },
    async selectPaymentMethod(method: P2PPaymentMethod) {
      this.selectedMethod = method
    },
    deletePaymentMethod(id: string) {
      this.methods = this.methods.filter((method) => method.id !== id)
    },
  },
})
