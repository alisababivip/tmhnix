<script setup lang="ts">
const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})
</script>
<template>
  <BasePlaceholderPage
    title="Payment Cancelled"
    subtitle="
        Your payment was cancelled. If this was a mistake, please try again."
  >
    <template #image>
      <img
        src="/img/illustrations/placeholders/flat/placeholder-search-3.svg"
        alt="placeholder-image"
      />
    </template>

    <div class="mt-2 flex justify-center gap-2">
      <BaseButton
        color="primary"
        :to="`/user/${flutter ? 'flutter/' : ''}wallets/fiat`"
        shape="curved"
      >
        <Icon name="ph:arrow-left-bold" class="h-4 w-4 mr-2" />
        {{ $t('Go to Wallets Page') }}
      </BaseButton>
    </div>
  </BasePlaceholderPage>
</template>
