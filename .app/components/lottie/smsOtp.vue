<script lang="ts" setup>
import item from '~~/assets/lottie/smsOtp.json'
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
