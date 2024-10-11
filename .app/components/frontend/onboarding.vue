<script setup lang="ts">
const frontendStore = useFrontendStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const stepsContent = computed(
  () => frontendStore.getSection('steps')?.content || {},
)
const currentTime = ref(new Date().toLocaleTimeString())
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}
let intervalId
onMounted(() => {
  intervalId = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
<template>
  <section
    id="steps"
    class="bg-slate-100 dark:bg-gray-900 p-5 xs:p-5 sm:p-10 md:px-28 min-h-screen flex items-center w-full"
  >
    <div class="container mx-auto relative z-10">
      <div
        class="flex flex-col-reverse md:flex-row items-center justify-between"
      >
        <div
          class="z-50 w-full lg:w-1/2"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <h3
            class="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900 dark:text-gray-100"
          >
            {{ stepsContent?.heading }}
          </h3>

          <ul class="space-y-8">
            <li
              v-for="step in stepsContent?.steps"
              :key="step.step"
              class="flex items-start"
            >
              <Icon
                :name="step.icon"
                class="w-14 h-14 mr-4"
                :class="step.iconColor"
              />
              <div>
                <p class="text-sm uppercase font-bold text-primary-500">
                  {{ step.step }}
                </p>
                <h6 class="text-lg font-bold mb-2">
                  {{ step.title }}
                </h6>
                <p class="text-base">
                  {{
                    step.description.replace('[site_name]', settings?.site_name)
                  }}
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div class="relative w-full lg:w-1/2">
          <LottieBinary />
        </div>
      </div>
    </div>
  </section>
</template>
