import { defineNuxtPlugin } from '#app'
import VueEasyLightbox from 'vue-easy-lightbox'

export default defineNuxtPlugin(nuxtApp => {
  const app = nuxtApp.vueApp
  app.component('VueEasyLightbox', VueEasyLightbox)
})
