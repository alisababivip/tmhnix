export const useNewsStore = defineStore({
  id: 'news',
  state: () => ({
    news: [],
    interval: null,
    activeArticle: null,
  }),
  actions: {
    async fetchNews() {
      let response = await fetch(
        'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
      )
      if (response.ok) {
        let json = await response.json()
        this.news = json['Data']
      } else {
        console.log('Fetch Error :-S', response.status)
      }
    },
    getNewsIfEmpty() {
      if (!this.news.length) {
        this.fetchNews()
      }
    },
    setupInterval() {
      if (!this.interval) {
        this.getNewsIfEmpty()
      } else {
        this.interval = setInterval(() => {
          this.getNewsIfEmpty()
        }, 300000) // fetch news every 5 minutes
      }
    },
    cleanupInterval() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    setActiveArticle(article) {
      this.activeArticle = article
    },
  },
})
