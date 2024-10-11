export const useAuthorStore = defineStore({
  id: 'author',

  // State definition
  state: () => ({
    authors: [],
    selectedAuthor: null,
    isLoading: false,
  }),

  // Getter
  getters: {
    getSelectedAuthor(state) {
      return state.selectedAuthor
    },
    getAuthors(state) {
      return state.authors
    },
  },

  // Actions
  actions: {
    async fetchAuthors(posts: boolean = true, status?: string) {
      const { getAuthors } = useBlog()
      try {
        const response = await getAuthors(posts, status)
        this.authors = response.data.result
        return response
      } catch (e) {
        return e
      }
    },

    async fetchAuthorById(id, posts: boolean = true) {
      const { getAuthor } = useBlog()
      try {
        const response = await getAuthor(id, posts)
        this.selectedAuthor = response.data.result
        return response
      } catch (e) {
        return e
      }
    },
  },
})
