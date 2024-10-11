<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Default Theme',
  permissions: ['Edit Default Layout'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const userStore = useUserStore()
const userPermissions = computed(() => userStore.getPermissions)
const userRole = computed(() => userStore.getRole)
const { primaryPresets, mutedPresets } = useColors()

const currentLayout = ref(settings.value?.default_layout ?? 'collapse')
const currentColor = ref(settings.value?.default_color ?? 'violet')
const currentBackgroundShader = ref(
  settings.value?.default_background_shader ?? 'slate',
)

const { layouts, activeLayoutName } = useLayoutSwitcher()
async function switchLayout(layout: string) {
  if (
    !userPermissions.value.some((permission) =>
      permission.includes('Edit Default Layout'),
    ) &&
    userRole.value !== 'Super Admin'
  ) {
    toast.dangerText('You do not have permission to edit the default layout.')
    return
  }
  currentLayout.value = layout
  await onSubmit()
  activeLayoutName.value = layout
  localStorage.setItem('layout-switcher-active', layout)
}
async function switchColor(color: (typeof primaryPresets)[number]) {
  if (
    !userPermissions.value.some((permission) =>
      permission.includes('Edit Default Layout'),
    ) &&
    userRole.value !== 'Super Admin'
  ) {
    toast.dangerText('You do not have permission to edit the default layout.')
    return
  }
  currentColor.value = color.name
  await onSubmit()
  switchColorShades('primary', color.shades)
}
async function switchBackgroundShader(color: (typeof mutedPresets)[number]) {
  if (
    !userPermissions.value.some((permission) =>
      permission.includes('Edit Default Layout'),
    ) &&
    userRole.value !== 'Super Admin'
  ) {
    toast.dangerText('You do not have permission to edit the default layout.')
    return
  }
  currentBackgroundShader.value = color.name
  await onSubmit()
  switchColorShades('muted', color.shades)
}

const { toast } = useUtils()
// This is where you would send the form data to the server
const onSubmit = async () => {
  try {
    const data = {
      default_layout: currentLayout.value,
      default_color: currentColor.value,
      default_background_shader: currentBackgroundShader.value,
    }
    const response = await updateSettings(data)
    if (response.status === 'success') {
      await updateSettings(data)
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      settingsStore.setSettings(Object.values(response.data.result))
    }
  } catch (error) {
    toast.danger(error)
  }
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  default_mode: z.string().nullable(),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => {
  return {
    default_mode: settings.value?.default_mode,
  }
})

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema,
  initialValues,
})

watch(
  () => values.default_mode,
  () => {
    update()
  },
)

// This is where you would send the form data to the server
const update = handleSubmit(async (values: any) => {
  try {
    const response = await updateSettings(values)
    toast.response(response)
    if (response.status === 'success') {
      await updateSettings(values)
      settingsStore.setSettings(Object.values(response.data.result))
    }
  } catch (error) {
    toast.danger(error)
  }
})
</script>

<template>
  <form method="POST" action="" class="w-full pb-16" @submit.prevent="onSubmit">
    <BaseCard>
      <div class="flex items-center justify-between p-4">
        <div>
          <BaseHeading
            tag="h2"
            size="sm"
            weight="medium"
            lead="normal"
            class="uppercase tracking-wider"
          >
            {{ $t('Theme') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t('Personalize your platform experience.') }}
          </BaseText>
        </div>
      </div>
      <div class="px-8">
        <div class="mx-auto space-y-12 py-8">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 sm:col-span-7 flex flex-col gap-4">
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
                  :class="
                    currentLayout === layout.name && '!border-primary-500'
                  "
                  @click="switchLayout(layout.name)"
                >
                  <div
                    class="bg-muted-50 dark:bg-muted-700/70 flex items-center justify-center rounded-lg py-6 sm:py-3"
                  >
                    <img
                      :src="`/img/illustrations/switcher/layout-${layout.name}-default.svg`"
                      class="block dark:hidden max-w-[110px] mx-auto transition-opacity duration-200"
                      :class="
                        currentLayout === layout.name
                          ? 'opacity-100'
                          : 'opacity-60'
                      "
                      :alt="`${layout.name} layout`"
                    />
                    <img
                      :src="`/img/illustrations/switcher/layout-${layout.name}-default-dark.svg`"
                      class="hidden dark:block max-w-[110px] mx-auto transition-opacity duration-200"
                      :class="
                        currentLayout === layout.name
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
                        currentLayout === layout.name
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
                        currentLayout === layout.name
                          ? 'opacity-100'
                          : 'opacity-0'
                      "
                    />
                  </div>
                </BaseCard>
              </div>
            </div>
            <div class="col-span-12 flex flex-col gap-4">
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
                      @click="() => switchColor(color)"
                      :class="[
                        currentColor === color.name
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
                          currentBackgroundShader === color.name
                            ? 'ring-1 ring-primary-500'
                            : 'ring-0',
                        ]"
                        :data-nui-tooltip="color.label"
                        @click="() => switchBackgroundShader(color)"
                      ></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-span-12 flex flex-col gap-4">
              <div>
                <BaseHeading
                  as="h4"
                  size="sm"
                  weight="medium"
                  class="text-muted-900 dark:text-white"
                >
                  Customize Dark Mode
                </BaseHeading>
                <BaseParagraph size="sm" class="text-muted-400">
                  Change the dark mode settings to match your preference.
                </BaseParagraph>
              </div>
              <div class="grid grid-cols-12 gap-4 pt-2 space-y-5">
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="default_mode"
                  >
                    <BaseListbox
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      :items="['Light', 'Dark']"
                      placeholder="Select an option"
                      label="Default Mode"
                      shape="rounded"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </form>
</template>
