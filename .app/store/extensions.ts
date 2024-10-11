export const useExtensionStore = defineStore({
  // unique id of the store across your application
  id: 'extension',

  // a function that returns a fresh state
  state: () => ({
    extensions: [],
    extensionsUser: [],
    selectedExtension: null,
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count extensions
      return state.extensions.length
    },
  },

  // actions/mutations
  actions: {
    async fetchExtensions() {
      this.loading = true
      const { getExtensions } = useSystem()
      const response = await getExtensions()
      if (response.status === 'success') {
        this.extensions = response.data.result
      }
      this.loading = false
    },
    async fetchExtensionsUser() {
      this.loading = true
      const { getExtensions } = useSettings()
      const response = await getExtensions()
      if (response.status === 'success') {
        this.extensionsUser = response.data.result
      }
      this.loading = false
    },
    getExtensionById(id: string) {
      this.selectedExtension = this.extensions.find(
        (item) => item.product_id.toLowerCase() === id,
      )
    },
  },
})
