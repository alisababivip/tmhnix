import type { Faq } from '~~/types'

export const useAdminFaqEntriesStore = defineStore({
  id: 'adminFaqs',

  state: () => ({
    faqs: [] as Faq[],
    loading: false,
    selectedFaq: null as Faq | null,
  }),

  getters: {
    getFaqById: (state) => (id: number) =>
      state.faqs.find((faq) => faq.id === id),
  },

  actions: {
    async fetchFaqs() {
      this.loading = true
      try {
        const { getAdminFaqs } = useFaq()
        const response = await getAdminFaqs()
        this.faqs = response.data.result
      } catch (error) {
        console.error('Error fetching FAQs:', error)
      }
      this.loading = false
    },
    async addFaq(faq: Faq) {
      this.faqs.push(faq)
    },
    async updateFaq(updatedFaq: Faq) {
      const index = this.faqs.findIndex((faq) => faq.id === updatedFaq.id)
      if (index !== -1) this.faqs[index] = updatedFaq
    },
    async removeFaq(id: number) {
      const index = this.faqs.findIndex((faq) => faq.id === id)
      if (index !== -1) this.faqs.splice(index, 1)
    },
    selectFaq(faq: Faq) {
      this.selectedFaq = faq
    },
    selectEntryById(id: number) {
      this.selectedFaq = this.faqs.find((faq) => faq.id === id) || null
    },
  },
})
