import { defineNuxtPlugin } from '#app'
import { useDarkModeStore } from '~~/store/darkMode'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const darkModeStore = useDarkModeStore()

    if (localStorage.getItem('isDarkMode') === 'true') {
      darkModeStore.setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      darkModeStore.setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }
})
