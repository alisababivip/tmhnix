import type { IcoProject } from '~~/types'
export const useIcoProjectStore = defineStore({
  id: 'icoProject',

  // State
  state: () => ({
    projects: [] as IcoProject[],
    loading: false,
    selectedProject: null as IcoProject | null,
  }),

  // Getters
  getters: {
    getProjectById: (state) => (id: number) =>
      state.projects.find((project) => project.id === id),
  },

  // Actions
  actions: {
    async fetchIcoProjects() {
      this.loading = true
      try {
        const { getIcoProjects } = useIco()
        const response = await getIcoProjects()
        this.projects = response.data.result
      } catch (error) {
        console.error('Error fetching deposit projects:', error)
      }
      this.loading = false
    },
    async removeProject(id: number) {
      const index = this.projects.findIndex((m) => m.id === id)
      this.projects.splice(index, 1)
    },
    async selectProject(project: IcoProject) {
      this.selectedProject = project
    },
    async selectProjectById(id: number) {
      this.selectedProject = this.projects.find((m) => m.id === id) || null
    },
  },
})
