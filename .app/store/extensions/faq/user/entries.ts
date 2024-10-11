export const useFaqsStore = defineStore({
  id: 'faqs',

  state: () => ({
    faqs: [] as Faq[],
    loading: false,
  }),

  actions: {
    async fetchFaqs(categoryIdentifier?: string) {
      this.loading = true
      try {
        const { getFaqs } = useFaq()
        const response = await getFaqs(categoryIdentifier)
        this.faqs = response.data.result
      } catch (error) {
        console.error('Error fetching FAQs:', error)
      }
      this.loading = false
    },
  },
})
