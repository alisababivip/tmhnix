<script setup lang="ts">
import type { ForexAccount } from '~~/types'

const route = useRoute()
const { accountId } = route.params
const windowHeight = ref(window.innerHeight)
const windowWidth = ref(window.innerWidth)
const { getForexAccount } = useForex()
const account = ref<ForexAccount | null>(null)

onMounted(async () => {
  window.addEventListener('resize', onResize)
  const response = await getForexAccount(accountId)
  if (response.status === 'success') {
    account.value = response.data.result
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

function onResize() {
  windowHeight.value = window.innerHeight
  windowWidth.value = window.innerWidth
}
</script>

<template>
  <iframe
    v-if="account !== null"
    :key="account.account_id"
    :src="`https://metatraderweb.app/trade?servers=${
      account.broker
    }&trade_server=${account.broker}&startup_mode=${
      account.type === 'DEMO' ? 'open_demo' : 'open_trade'
    }&startup_version=${account.mt}&lang=EN&save_password=on&login=${
      account.account_id
    }&password=${account.password}&leverage=${account.leverage}`"
    :allowfullscreen="true"
    class="h-[calc(100vh_-_96px)] min-h-full w-full min-w-full"
  >
  </iframe>
</template>
