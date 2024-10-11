import type { EcommerceCategory } from '~~/types'

export const useAdminEcommerceCategoriesStore = defineStore({
  id: 'adminEcommerceCategories',

  state: () => ({
    categories: [] as EcommerceCategory[],
    loading: false,
    selectedCategory: null as EcommerceCategory | null,
  }),

  getters: {
    getCategoryById: (state) => (id: number) =>
      state.categories.find((category) => category.id === id),
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const { getAdminCategories } = useEcommerce()
        const response = await getAdminCategories()
        this.categories = response.data.result
      } catch (error) {
        console.error('Error fetching admin categories:', error)
      }
      this.loading = false
    },
    async removeCategory(id: number) {
      const index = this.categories.findIndex((category) => category.id === id)
      if (index !== -1) this.categories.splice(index, 1)
    },
    async selectCategory(category: EcommerceCategory) {
      this.selectedCategory = category
    },
    async selectCategoryById(id: number) {
      this.selectedCategory = this.getCategoryById(id)
    },
  },
})
