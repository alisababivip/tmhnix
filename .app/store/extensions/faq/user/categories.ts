export const useFaqCategoriesStore = defineStore({
  id: 'faq-categories',

  state: () => ({
    categories: [] as FaqCategory[],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const { getCategories } = useFaq()
        const response = await getCategories()
        this.categories = response.data.result
      } catch (error) {
        console.error('Error fetching user categories:', error)
      }
      this.loading = false
    },
  },
})
