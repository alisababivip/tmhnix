export const useFrontendStore = defineStore({
  id: 'frontend',
  state: () => ({
    sections: [],
  }),
  actions: {
    async fetchSections() {
      const { getFrontendSections } = useFrontend()
      const response = await getFrontendSections()
      this.sections = response.data.result
    },
    getSection(sectionName: string) {
      return this.sections.find((section) => section.section === sectionName)
    },
  },
})
