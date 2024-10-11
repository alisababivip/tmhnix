<script setup lang="ts">
const frontendStore = useFrontendStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const featuresContent = computed(
  () => frontendStore.getSection('features')?.content || {},
)
</script>

<template>
  <section
    id="features"
    class="bg-slate-200 bg-opacity-70 dark:bg-gray-950 xs:p-5 sm:p-10 min-h-screen w-full z-10 flex items-center justify-center"
  >
    <div class="container mx-auto z-10">
      <div class="flex flex-col-reverse md:flex-row">
        <div class="w-full md:w-1/2 px-10">
          <LottieAnalytics />
        </div>
        <div class="w-full md:w-1/2 z-10 justify-center items-center flex">
          <div class="p-4" data-aos="fade-up" data-aos-duration="1000">
            <h3 class="text-4xl font-semibold dark:text-gray-100 mb-4">
              {{ featuresContent?.heading }}
            </h3>
            <p class="text-lg dark:text-gray-300 mb-8">
              {{ featuresContent?.subtext?.part1 }} {{ settings?.site_name }}
              {{ featuresContent?.subtext?.part2 }}
            </p>
            <ul>
              <li
                class="flex items-center mb-6"
                v-for="feature in featuresContent?.features"
                :key="feature.title"
              >
                <div class="ml-4">
                  <h6 class="text-lg font-semibold dark:text-gray-300">
                    {{ feature.title }}
                  </h6>
                  <p class="text-base dark:text-gray-400">
                    {{ feature.description }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
