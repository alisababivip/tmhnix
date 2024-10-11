<script lang="ts" setup>
import item from '~~/assets/lottie/woman-trading-in-forex-market-using-mobile-app.json'
const props = defineProps({
  height: {
    type: String,
  },
  width: {
    type: String,
  },
  classes: {
    type: String,
  },
})
</script>
<template>
  <client-only>
    <Vue3Lottie
      :animationData="item"
      :height="height"
      :width="width"
      :class="classes"
    />
  </client-only>
</template>
