<script setup lang="ts">
definePageMeta({
  permissions: ['Access MLM Management'],
  title: 'MLM Management',
})

const { getAnalytics } = useMlm()
const analytics = ref<any>({})

async function fetchMetrics() {
  const response = (await getAnalytics()) as any
  if (response.status === 'success') {
    analytics.value = response.data.result
  }
}

onMounted(async () => {
  await fetchMetrics()
})
</script>

<template>
  <div class="space-y-5">
    <div
      class="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
    >
      <div
        class="relative"
        v-for="(item, index) in analytics.metrics"
        :key="index"
      >
        <BaseCard class="space-y-1 p-5">
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            {{ item.metric }}
          </BaseParagraph>
          <BaseHeading
            size="lg"
            weight="semibold"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ item.value }}</span>
          </BaseHeading>
        </BaseCard>
      </div>
    </div>
    <LottieReferralMarketing height="500px" />
  </div>
</template>
