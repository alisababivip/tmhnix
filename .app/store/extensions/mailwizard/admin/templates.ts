import type { MailWizardTemplate } from '~~/types'

export const useAdminMailWizardTemplatesStore = defineStore({
  id: 'adminMailWizardTemplates',

  state: () => ({
    templates: [] as MailWizardTemplate[],
    loading: false,
    selectedTemplate: null as MailWizardTemplate | null,
  }),

  getters: {
    getTemplateById: (state) => (id: number) =>
      state.templates.find((template) => template.id === id),
  },

  actions: {
    async fetchTemplates() {
      this.loading = true
      try {
        const { getTemplates } = useMailwizard()
        const response = await getTemplates()
        this.templates = response.data.result
      } catch (error) {
        console.error('Error fetching admin templates:', error)
      }
      this.loading = false
    },
    async addTemplate(template: MailWizardTemplate) {
      this.templates.push(template)
    },
    async updateTemplate(updatedTemplate: MailWizardTemplate) {
      const index = this.templates.findIndex(
        (template) => template.id === updatedTemplate.id,
      )
      if (index !== -1) {
        this.templates[index] = updatedTemplate
      }
    },
    async removeTemplate(id: number) {
      const index = this.templates.findIndex((template) => template.id === id)
      if (index !== -1) {
        this.templates.splice(index, 1)
      }
    },
    async selectTemplate(template: MailWizardTemplate) {
      this.selectedTemplate = template
    },
    async selectTemplateById(id: number) {
      this.selectedTemplate = this.getTemplateById(id)
    },
  },
})
