<script setup lang="ts">
const frontendStore = useFrontendStore()

const marketsContent = computed(
  () => frontendStore.getSection('markets')?.content || {},
)
</script>

<template>
  <section
    id="markets"
    class="bg-slate-100 bg-opacity-70 dark:bg-gray-900 xs:p-5 sm:p-10 md:px-20 md:py-10 min-h-screen w-full z-10"
  >
    <h3 class="text-4xl font-semibold dark:text-gray-100 mb-4 text-center z-10">
      {{ marketsContent?.heading }}
    </h3>
    <h4 class="text-lg font-medium dark:text-gray-400 mb-4 text-center z-10">
      {{ marketsContent?.subtext }}
    </h4>
    <MarketAnalysis class="z-10" />
  </section>
</template>
