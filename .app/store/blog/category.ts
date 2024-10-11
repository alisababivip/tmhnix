export const useCategoryStore = defineStore({
  id: 'category',

  // State definition
  state: () => ({
    categories: [],
    selectedCategory: null,
    isLoading: false,
  }),

  // Getter
  getters: {
    getSelectedCategory(state) {
      return state.selectedCategory
    },
    getCategories(state) {
      return state.categories
    },
  },

  // Actions
  actions: {
    async fetchCategories(posts: boolean = true) {
      const { getCategories } = useBlog()
      try {
        const response = await getCategories(posts)
        this.categories = response.data.result
        return response
      } catch (e) {
        return e
      }
    },

    async fetchCategoryById(id, posts: boolean = true) {
      const { getCategory } = useBlog()
      try {
        const response = await getCategory(id, posts)
        this.selectedCategory = response.data.result
        return response
      } catch (e) {
        return e
      }
    },

    async createNewCategory(category: any) {
      const { createCategory } = useBlog()
      try {
        const response = await createCategory(category)
        this.categories.push(response.data.result)
        return response
      } catch (e) {
        return e
      }
    },
  },
})
