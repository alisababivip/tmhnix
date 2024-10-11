import type { Category, Post, Tag } from '~~/types'

const { getCategories, getPosts, getComments, getTags } = useBlog()

export const useBlogStore = defineStore({
  id: 'blog',

  state: () => ({
    categories: [],
    posts: [],
    comments: [],
    tags: [],
    selectedPost: null,
    selectedCategory: null,
    selectedTag: null,
    loading: false,
  }),

  // optional getters
  getters: {
    selectedCategoryPosts(state) {
      return state.selectedCategory?.post || []
    },
    selectedPostComments(state) {
      return state.comments
        ? state.comments.filter(
            (comment) => comment.postId === state.selectedPost?.id,
          )
        : []
    },
    selectedTagPosts(state) {
      if (!state.selectedTag || !state.tags) return []
      const tagWithPosts = state.tags.find(
        (tag) => tag.slug === state.selectedTag.slug,
      )
      return tagWithPosts
        ? tagWithPosts.post_tag.map((postTag) => postTag.post)
        : []
    },
  },

  // actions/mutations
  actions: {
    async fetchCategories() {
      this.loading = true
      const response = await getCategories()
      if (response.status === 'success') {
        this.categories = response.data.result
      }
      this.loading = false
    },

    async fetchPosts() {
      const response = await getPosts()
      if (response.status === 'success') {
        this.posts = response.data.result
      }
    },

    async fetchComments() {
      const response = await getComments()
      if (response.status === 'success') {
        this.comments = response.data.result
      }
    },

    async fetchTags() {
      const response = await getTags()
      if (response.status === 'success') {
        this.tags = response.data.result
      }
    },

    selectCategory(category: Category) {
      this.selectedCategory = category
    },
    selectPost(post: Post) {
      this.selectedPost = post
    },
    selectTag(tag: Tag) {
      this.selectedTag = tag
    },
    async getPostBySlug(slug: string) {
      if (!this.posts) {
        // You may want to fetch posts if they haven't been loaded
        await this.fetchPosts()
      }

      // Find and return the post that matches the given slug
      return this.posts?.find((post) => post.slug === slug) || null
    },
  },
})
