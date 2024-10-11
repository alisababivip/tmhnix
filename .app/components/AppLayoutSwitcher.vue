<script setup lang="ts">
/**
 * Here we use the useLayoutSwitcher() composable to load available layouts.
 * We also load colors from Tailwind and Shuriken UI.
 * We use the switchColorShades() function to dynamically change the colors.
 */

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const { layouts, activeLayoutName } = useLayoutSwitcher()

const { primaryPresets, mutedPresets } = useColors()
const route = useRoute()
const isSwitcherOpen = useState('switcher-open', () => false)
const currentPrimary = ref(settings.value?.default_color ?? 'violet')
const currentMuted = ref(settings.value?.default_background_shader ?? 'slate')

// Close the modal when the primary or muted color changes
watch([currentPrimary, currentMuted], closeModal)

// We can only change layout dynamically on the default layout
const canChangeLayout = computed(
  () => !route.meta.layout || route.meta.layout === 'default',
)

function closeModal() {
  isSwitcherOpen.value = false
}
function switchLayout(layout: string) {
  activeLayoutName.value = layout
  localStorage.setItem('layout-switcher-active', layout)
  closeModal()
}
function switchPrimary(color: (typeof primaryPresets)[number]) {
  currentPrimary.value = color.name
  switchColorShades('primary', color.shades)
}
function switchMuted(color: (typeof mutedPresets)[number]) {
  currentMuted.value = color.name
  switchColorShades('muted', color.shades)
}
</script>

<template>
  <TairoModal
    :open="isSwitcherOpen"
    :size="canChangeLayout ? '2xl' : 'sm'"
    @close="isSwitcherOpen = false"
  >
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          Personalize Your Experience
        </h3>

        <BaseButtonClose @click="closeModal" />
      </div>
    </template>

    <!-- Body -->
    <div
      class="px-4 pb-4 md:px-6 md:pb-6 max-h-[550px] overflow-y-auto nui-slimscroll"
    >
      <div class="grid grid-cols-12 gap-6">
        <div
          v-if="canChangeLayout"
          class="col-span-12 sm:col-span-7 flex flex-col gap-4"
        >
          <div>
            <BaseHeading
              as="h4"
              size="sm"
              weight="medium"
              class="text-muted-900 dark:text-white"
            >
              Choose Your Layout
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              Select a layout style that works best for you.
            </BaseParagraph>
          </div>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted-100 dark:bg-muted-700/40 rounded-xl"
          >
            <BaseCard
              v-for="layout in layouts"
              :key="layout.name"
              role="button"
              shape="curved"
              class="p-2"
              :class="activeLayoutName === layout.name && '!border-primary-500'"
              @click="switchLayout(layout.name)"
            >
              <div
                class="bg-muted-50 dark:bg-muted-700/70 flex items-center justify-center rounded-lg py-6 sm:py-3"
              >
                <img
                  :src="`/img/illustrations/switcher/layout-${layout.name}-default.svg`"
                  class="block dark:hidden max-w-[110px] mx-auto transition-opacity duration-200"
                  :class="
                    activeLayoutName === layout.name
                      ? 'opacity-100'
                      : 'opacity-60'
                  "
                  :alt="`${layout.name} layout`"
                />
                <img
                  :src="`/img/illustrations/switcher/layout-${layout.name}-default-dark.svg`"
                  class="hidden dark:block max-w-[110px] mx-auto transition-opacity duration-200"
                  :class="
                    activeLayoutName === layout.name
                      ? 'opacity-100'
                      : 'opacity-60'
                  "
                  :alt="`${layout.name} layout`"
                />
              </div>
              <div class="flex items-center justify-between py-2">
                <BaseText
                  size="xs"
                  class="capitalize"
                  :class="
                    activeLayoutName === layout.name
                      ? 'text-muted-600 dark:text-muted-100'
                      : 'text-muted-400 dark:text-muted-500'
                  "
                >
                  {{ layout.name }} Layout
                </BaseText>
                <Icon
                  name="ph:check-circle-duotone"
                  class="w-5 h-5 text-success-500 transition-opacity duration-200"
                  :class="
                    activeLayoutName === layout.name
                      ? 'opacity-100'
                      : 'opacity-0'
                  "
                />
              </div>
            </BaseCard>
          </div>
        </div>
        <div
          class="col-span-12 flex flex-col gap-4"
          :class="[canChangeLayout ? 'sm:col-span-5' : '']"
        >
          <div>
            <BaseHeading
              as="h4"
              size="sm"
              weight="medium"
              class="text-muted-900 dark:text-white"
            >
              Customize Colors
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400">
              Change the color theme to match your preference.
            </BaseParagraph>
          </div>
          <div class="space-y-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <div v-for="color in primaryPresets" :key="color.name">
                <button
                  type="button"
                  class="group w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-muted-700/70 transition-colors duration-200"
                  @click="() => switchPrimary(color)"
                  :class="[
                    currentPrimary === color.name
                      ? 'ring-1 ring-primary-500 z-10 relative'
                      : 'ring-0',
                  ]"
                >
                  <span
                    class="block h-6 w-6 rounded-lg shrink-0"
                    :class="color.class"
                  ></span>
                  <BaseText size="sm">{{ color.label }}</BaseText>
                </button>
              </div>
            </div>
            <hr class="border-muted-200 dark:border-muted-700" />
            <div>
              <button
                type="button"
                class="group w-full flex items-center gap-3 p-2 rounded-lg"
              >
                <span
                  class="block h-6 w-6 rounded-lg bg-muted-200 dark:bg-muted-900"
                ></span>
                <BaseText size="sm">Background shade</BaseText>
              </button>
              <div class="flex items-center px-2 pt-2">
                <BaseText size="xs" class="text-muted-400"
                  >Pick a shade</BaseText
                >
                <div class="ml-auto flex items-center justify-end gap-2">
                  <button
                    v-for="color in mutedPresets"
                    :key="color.name"
                    type="button"
                    class="block h-6 w-6 rounded-full"
                    :class="[
                      color.class,
                      currentMuted === color.name
                        ? 'ring-1 ring-primary-500'
                        : 'ring-0',
                    ]"
                    :data-nui-tooltip="color.label"
                    @click="() => switchMuted(color)"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TairoModal>
</template>
