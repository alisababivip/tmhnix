import { defineNuxtPlugin } from '#app'
import { UseWagmiPlugin, createConfig, mainnet } from 'use-wagmi'
import { createPublicClient, http } from 'viem'

export default defineNuxtPlugin((nuxtApp) => {
  const config = createConfig({
    autoConnect: true,
    publicClient: createPublicClient({
      chain: mainnet,
      transport: http(),
    }),
  })

  const app = nuxtApp.vueApp
  app.use(UseWagmiPlugin, config)
})
