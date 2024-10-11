import { defineStore } from 'pinia'

export const useDarkModeStore = defineStore({
  id: 'darkMode',
  state: () => ({
    isDarkMode: localStorage.getItem('isDarkMode') === 'true', // Initialize with local storage
  }),
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('isDarkMode', this.isDarkMode.toString())

      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode(isDark: boolean) {
      this.isDarkMode = isDark
      localStorage.setItem('isDarkMode', isDark.toString())

      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})
