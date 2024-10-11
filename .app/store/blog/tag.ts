export const useTagStore = defineStore({
  id: 'tag',

  // State definition
  state: () => ({
    tags: [],
    selectedTag: null,
    isLoading: false,
  }),

  // Getter
  getters: {
    getSelectedTag(state) {
      return state.selectedTag
    },
    getTags(state) {
      return state.tags
    },
  },

  // Actions
  actions: {
    async fetchTags(posts: boolean = true) {
      const { getTags } = useBlog()
      try {
        const response = await getTags(posts)
        this.tags = response.data.result
        return response
      } catch (e) {
        return e
      }
    },

    async fetchTagById(id, posts: boolean = true) {
      const { getTag } = useBlog()
      try {
        const response = await getTag(id, posts)
        this.selectedTag = response.data.result
        return response
      } catch (e) {
        return e
      }
    },
  },
})
