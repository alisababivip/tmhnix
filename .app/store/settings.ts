export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: [] as any,
    lastFetch: null,
  }),
  actions: {
    async fetchSettings() {
      const now = Date.now()
      const fifteenMinutesAgo = now - 15 * 60 * 1000
      if (
        this.settings.length === 0 ||
        !this.lastFetch ||
        this.lastFetch < fifteenMinutesAgo
      ) {
        const { getSettings } = useSettings()
        const response = await getSettings()
        if (response.status === 'success') {
          const settings = response.data.result
          this.setSettings(settings)
          this.lastFetch = now
        }
      }
    },
    setSettings(settingsArray) {
      // Check if settingsArray is an array
      if (!Array.isArray(settingsArray)) {
        console.error(
          'Expected an array for settingsArray, but got:',
          settingsArray,
        )
        return
      }

      const newSettings = settingsArray.reduce((acc, setting) => {
        // Convert "enabled" and "disabled" to boolean
        if (setting.value === 'Enabled') {
          acc[setting.key] = true
        } else if (setting.value === 'Disabled') {
          acc[setting.key] = false
        } else if (
          setting.key === 'mlm_settings' ||
          setting.key === 'social_links'
        ) {
          acc[setting.key] = JSON.parse(setting.value)
        } else {
          acc[setting.key] = setting.value
        }
        return acc
      }, {})

      // Merge new settings into existing settings
      this.settings = { ...this.settings, ...newSettings }
    },

    // Invalidate cache and fetch settings again
    async invalidateCacheAndFetch() {
      this.lastFetch = null
      await this.fetchSettings()
    },
  },
  getters: {
    siteName() {
      return this.settings?.site_name || 'Crypto Trading'
    },
  },
})
