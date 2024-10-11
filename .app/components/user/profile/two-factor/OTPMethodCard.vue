<script lang="ts" setup>
import smsOtpJson from '~~/assets/lottie/smsOtp.json'
import appOtpJson from '~~/assets/lottie/appOtp.json'

const props = defineProps({
  image: String,
  alt: String,
  title: String,
  description: String,
})
</script>

<template>
  <BaseCard
    shape="curved"
    class="peer-checked:!border-primary-500 relative border-2 p-8 opacity-60 grayscale peer-checked:opacity-100 peer-checked:grayscale-0 peer-checked:[&_.child]:!opacity-100"
  >
    <div class="flex flex-col text-center">
      <LottieSmsOtp v-if="image === 'sms'" classes="mx-auto max-w-[160px]" />
      <LottieAppOtp v-else classes="mx-auto max-w-[160px]" />
      <BaseHeading size="md" weight="medium">{{ title }}</BaseHeading>
      <BaseParagraph
        size="xs"
        lead="snug"
        class="text-muted-500 dark:text-muted-400"
      >
        {{ description }}
      </BaseParagraph>
    </div>
    <slot></slot>
  </BaseCard>
</template>
