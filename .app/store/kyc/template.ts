import { defineStore } from 'pinia'
import type { KycTemplate } from '~~/types'

export const useKycTemplateStore = defineStore({
  // Unique id of the store across your application
  id: 'kycTemplate',

  // A function that returns a fresh state
  state: () => ({
    templates: [] as KycTemplate[],
    selectedTemplate: {} as KycTemplate,
    loading: false,
  }),

  // Optional getters
  getters: {
    count(state) {
      // Getter function to count the number of KYC Templates
      return state.templates.length
    },
  },

  // Actions/Mutations
  actions: {
    async fetchKycTemplates() {
      this.loading = true
      const { getKycTemplates } = useKyc()
      const response = await getKycTemplates()
      if (response.status === 'success') {
        this.templates = response.data.result
      }
      this.loading = false
    },

    selectTemplate(template: KycTemplate) {
      this.selectedTemplate = template
    },

    getTemplateById(id: string) {
      return this.templates.find((template) => template.id === id)
    },

    selectTemplateById(id: string) {
      const template = this.getTemplateById(id)
      if (template) {
        this.selectTemplate(template)
      }
    },
  },
})
