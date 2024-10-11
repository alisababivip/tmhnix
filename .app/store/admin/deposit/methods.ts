import type { DepositMethod } from '~~/types'

export const useDepositMethodStore = defineStore({
  id: 'DepositMethods',

  // State
  state: () => ({
    methods: [] as DepositMethod[],
    loading: false,
    selectedMethod: null as DepositMethod | null,
  }),

  // Getters
  getters: {
    getMethodById: (state) => (id: number) =>
      state.methods.find((method) => method.id === id),
  },

  // Actions
  actions: {
    async fetchDepositMethods() {
      this.loading = true
      try {
        const { getDepositMethods } = useWallet()
        const response = await getDepositMethods()
        this.methods = response.data.result
      } catch (error) {
        console.error('Error fetching deposit methods:', error)
      }
      this.loading = false
    },

    async selectMethod(method: DepositMethod) {
      this.selectedMethod = method
    },
    async selectMethodById(id: number) {
      this.selectedMethod = this.methods.find((m) => m.id === id) || null
    },

    async updateDepositMethodsStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update methods' status by IDs
        // Assuming you have a composable function like `updatemethodsStatus` to do this
        const { updateDepositMethodStatus } = useWallet()
        const response = await updateDepositMethodStatus(ids, status)

        // Update the methods in the state
        this.methods = this.methods.map((method) =>
          ids.includes(method.id) ? { ...method, status } : method,
        )

        return response
      } catch (error) {
        return error
      }
    },
    updateCustomFields(newFields: CustomField[]) {
      // Update the custom fields in the state
      this.selectedMethod.custom_fields = newFields
    },
  },
})
