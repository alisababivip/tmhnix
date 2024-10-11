<script setup lang="ts">
const frontendStore = useFrontendStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const bannerContent = computed(
  () => frontendStore.getSection('banner')?.content || {},
)
</script>

<template>
  <section
    id="banner"
    class="bg-slate-200 dark:bg-gray-950 xs:px-5 sm:px-10 md:px-20 py-20 min-h-screen flex items-center w-full"
  >
    <div class="container mx-auto z-10">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="w-full xs:w-full md:w-[40%] text-center md:text-left">
          <h2
            class="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900 dark:text-gray-100"
          >
            {{ bannerContent?.heading }}
          </h2>
          <p class="text-lg mb-12 text-gray-800 dark:text-gray-200">
            {{ settings?.site_name }}
            {{ bannerContent?.subtext?.part1 }}
            {{ bannerContent?.subtext?.part2 }}.
          </p>
          <NuxtLink
            to="/user"
            class="inline-block px-8 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-300"
          >
            <span>{{ bannerContent?.button }}</span>
          </NuxtLink>
        </div>
        <div class="w-full xs:w-full md:w-[60%]">
          <img
            :src="bannerContent?.image"
            class="w-full h-auto slow-bounce drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  </section>
</template>
