import type { IcoContribution } from '~~/types'
export const useIcoContributionStore = defineStore({
  id: 'icoContribution',

  // State
  state: () => ({
    contributions: [] as IcoContribution[],
    loading: false,
    selectedContribution: null as IcoContribution | null,
  }),

  // Getters
  getters: {
    getContributionById: (state) => (id: number) =>
      state.contributions.find((contribution) => contribution.id === id),
  },

  // Actions
  actions: {
    async fetchIcoContributions() {
      this.loading = true
      try {
        const { getIcoContributions } = useIco()
        const response = await getIcoContributions()
        this.contributions = response.data.result
      } catch (error) {
        console.error('Error fetching deposit contributions:', error)
      }
      this.loading = false
    },
    async removeContribution(id: number) {
      const index = this.contributions.findIndex((m) => m.id === id)
      this.contributions.splice(index, 1)
    },
    async selectContribution(contribution: IcoContribution) {
      this.selectedContribution = contribution
    },
    async selectContributionById(id: number) {
      this.selectedContribution =
        this.contributions.find((m) => m.id === id) || null
    },
  },
})
