import type { IcoPhase } from '~~/types'
export const useIcoPhaseStore = defineStore({
  id: 'icoAdminPhase',

  // State
  state: () => ({
    phases: [] as IcoPhase[],
    loading: false,
    selectedPhase: null as IcoPhase | null,
  }),

  // Getters
  getters: {
    getPhaseById: (state) => (id: number) =>
      state.phases.find((phase) => phase.id === id),
  },

  // Actions
  actions: {
    async fetchIcoPhases() {
      this.loading = true
      try {
        const { getAdminIcoPhases } = useIco()
        const response = await getAdminIcoPhases()
        this.phases = response.data.result
      } catch (error) {
        console.error('Error fetching deposit phases:', error)
      }
      this.loading = false
    },
    async removePhase(id: number) {
      const index = this.phases.findIndex((m) => m.id === id)
      this.phases.splice(index, 1)
    },
    async selectPhase(phase: IcoPhase) {
      this.selectedPhase = phase
    },
    async selectPhaseById(id: number) {
      this.selectedPhase = this.phases.find((m) => m.id === id) || null
    },
  },
})
