import type { Post } from '~~/types'
export const usePostStore = defineStore({
  id: 'post',

  // State definition
  state: () => ({
    posts: [] as Post[],
    selectedPost: null,
    isLoading: false,
    error: null,
  }),

  // Getter
  getters: {
    getSelectedPost(state) {
      return state.selectedPost
    },
    getPosts(state) {
      return state.posts
    },
  },

  // Actions
  actions: {
    async fetchPosts(
      user?: string,
      category?: string,
      tag?: string,
      status?: string,
    ) {
      const { getPosts } = useBlog()
      this.isLoading = true
      try {
        const response = await getPosts(user, category, tag, status)
        this.posts = response.data.result
      } catch (e) {
        this.error = e.message
      }
      this.isLoading = false
    },

    async fetchPostById(id) {
      const { getPost } = useBlog()
      this.isLoading = true
      try {
        const response = await getPost(id)
        this.selectedPost = response.data.result
      } catch (e) {
        this.error = e.message
      }
      this.isLoading = false
    },

    async createNewPost(post) {
      const { createPost } = useBlog()
      try {
        const response = await createPost(post)
        this.posts.push(response.data.result)
      } catch (e) {
        this.error = e.message
      }
    },

    async updateExistingPost(slug, post) {
      const { updatePost } = useBlog()
      try {
        const response = await updatePost(slug, post)
        const index = this.posts.findIndex((p) => p.slug === slug)
        if (index !== -1) {
          this.posts[index] = response.data.result
        }
      } catch (e) {
        this.error = e.message
      }
    },

    async deletePostById(id) {
      const { deletePost } = useBlog()
      try {
        const response = await deletePost(id)
        this.posts = this.posts.filter((post) => post.id !== id)
      } catch (e) {
        this.error = e.message
      }
    },
  },
})
