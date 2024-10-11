import type { Investment } from '~~/types'

export const useInvestmentStore = defineStore({
  // unique id of the store across your application
  id: 'investment',

  // a function that returns a fresh state
  state: () => ({
    investments: [] as Investment[],
    userInvestment: null,
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count Investments
      return state.investments.length
    },
  },

  // actions/mutations
  actions: {
    async fetchInvestments() {
      this.loading = true
      const { getInvestments } = useInvestment()
      const response = await getInvestments()
      if (response.status === 'success') {
        this.investments = response.data.result
      }
      this.loading = false
    },

    async fetchUserInvestment() {
      const { getUserInvestment } = useInvestment()
      const response = await getUserInvestment()
      if (response.status === 'success') {
        this.userInvestment = response.data.result ?? null
      }
    },

    async createInvestment(plan: number, amount: number) {
      const { createInvestment } = useInvestment()
      const response = await createInvestment(plan, amount)
      if (response.status === 'success') {
        this.investments.push(response.data.result)
      }
    },

    async cancelInvestment(investmentUuid: string) {
      const { cancelInvestment } = useInvestment()
      try {
        const response = await cancelInvestment(investmentUuid)
        this.investments.map((Investment) => {
          if (Investment.uuid === investmentUuid) {
            Investment.status = 'CANCELLED'
          }
        })
        return response
      } catch (error) {
        return error
      }
    },

    async deleteInvestment(id: Number) {
      const { deleteInvestment } = useInvestment()
      const response = await deleteInvestment(id)
      if (response.status === 'success') {
        this.investments = this.investments.filter(
          (Investment) => Investment.id !== id,
        )
      }
    },
  },
})
