import type { WithdrawMethod } from '~~/types'

export const useWithdrawMethodStore = defineStore({
  id: 'withdrawMethods',

  // State
  state: () => ({
    methods: [] as WithdrawMethod[],
    loading: false,
    selectedMethod: null as WithdrawMethod | null,
  }),

  // Getters
  getters: {
    getMethodById: (state) => (id: number) =>
      state.methods.find((method) => method.id === id),
  },

  // Actions
  actions: {
    async fetchWithdrawMethods() {
      this.loading = true
      try {
        const { getWithdrawMethods } = useWallet()
        const response = await getWithdrawMethods()
        this.methods = response.data.result
      } catch (error) {
        console.error('Error fetching withdraw methods:', error)
      }
      this.loading = false
    },

    async selectMethod(method: WithdrawMethod) {
      this.selectedMethod = method
    },
    async selectMethodById(id: number) {
      this.selectedMethod = this.methods.find((m) => m.id === id) || null
    },

    async updateWithdrawMethodsStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update methods' status by IDs
        // Assuming you have a composable function like `updatemethodsStatus` to do this
        const { updateWithdrawMethodStatus } = useWallet()
        const response = await updateWithdrawMethodStatus(ids, status)

        // Update the methods in the state
        this.methods = this.methods.map((method) =>
          ids.includes(method.id) ? { ...method, status } : method,
        )

        return response
      } catch (error) {
        return error
      }
    },
  },
})
