//dotlottie.client.js
import { defineNuxtPlugin } from '#app'
import { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player-light'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('DotLottiePlayer', DotLottiePlayer)
})
