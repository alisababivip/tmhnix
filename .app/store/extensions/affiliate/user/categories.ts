import type { EcommerceCategory } from '~~/types'

export const useUserEcommerceCategoriesStore = defineStore({
  id: 'userEcommerceCategories',

  state: () => ({
    categories: [] as EcommerceCategory[],
    loading: false,
  }),

  getters: {
    getCategoryById: (state) => (id: number) =>
      state.categories.find((category) => category.id === id),
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const { getUserCategories } = useEcommerce()
        const response = await getUserCategories()
        this.categories = response.data.result
      } catch (error) {
        console.error('Error fetching user categories:', error)
      }
      this.loading = false
    },
  },
})
