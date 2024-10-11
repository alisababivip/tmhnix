<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Logo Settings',
  permissions: ['Access Logo Settings'],
})

const { updateSettings } = useSettings()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  logo: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
  card_logo: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
  dark_logo: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
  full_logo: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
  dark_full_logo: z
    .union([z.string(), z.custom<File>((v) => v instanceof File)])
    .nullable(),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  logo: settings.value.logo || null,
  card_logo: settings.value.card_logo || null,
  dark_logo: settings.value.dark_logo || null,
  full_logo: settings.value.full_logo || null,
  dark_full_logo: settings.value.dark_full_logo || null,
}))

const { setFieldError, errors, setFieldValue, setErrors } = useForm({
  validationSchema,
  initialValues,
})

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const logoFile = ref<FileList | null>(settings.value.logo || null)
const card_logoFile = ref<FileList | null>(settings.value.card_logo || null)
const dark_logoFile = ref<FileList | null>(settings.value.dark_logo || null)
const full_logoFile = ref<FileList | null>(settings.value.full_logo || null)
const dark_full_logoFile = ref<FileList | null>(
  settings.value.dark_full_logo || null,
)

const fileError = useFieldError('avatar')

// Watch for changes in each file input
watch(logoFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('logo', file)
  if (logoFile.value) {
    handleFileUpload('logo')
  }
})

watch(dark_logoFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('dark_logo', file)
  if (dark_logoFile.value) {
    handleFileUpload('dark_logo')
  }
})

watch(full_logoFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('full_logo', file)
  if (full_logoFile.value) {
    handleFileUpload('full_logo')
  }
})

watch(dark_full_logoFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('dark_full_logo', file)
  if (dark_full_logoFile.value) {
    handleFileUpload('dark_full_logo')
  }
})

watch(card_logoFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('card_logo', file)
  if (card_logoFile.value) {
    handleFileUpload('card_logo')
  }
})

const handleFileUpload = async (
  logoType: 'logo' | 'dark_logo' | 'full_logo' | 'dark_full_logo' | 'card_logo',
) => {
  const inputFile = computed(() => {
    switch (logoType) {
      case 'logo':
        return logoFile
      case 'dark_logo':
        return dark_logoFile
      case 'full_logo':
        return full_logoFile
      case 'dark_full_logo':
        return dark_full_logoFile
      case 'card_logo':
        return card_logoFile
    }
  })

  // Initialize the response variable
  let uploadResponse

  try {
    success.value = false
    const body = new FormData()
    body.append('files', inputFile.value.value[0])
    body.append('oldImagePath', settings.value[logoType])
    body.append('type', 'logo')
    uploadResponse = await useFetch('/api/upload', {
      method: 'POST',
      body,
    })

    if (uploadResponse && uploadResponse.data.value !== '') {
      const data = {
        [logoType]: uploadResponse.data.value[0], // Use computed property name
      }

      let settingsResponse = await updateSettings(data) // Use a different variable name

      if (settingsResponse.status === 'success') {
        settingsResponse = await updateSettings(data)
        document.documentElement.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        success.value = true

        settingsStore.setSettings(Object.values(settingsResponse.data.result))

        setTimeout(() => {
          success.value = false
        }, 3000)
      }
    }
  } catch (error) {
    console.log(error)
    for (const [key, value] of Object.entries(error.data.errors)) {
      setFieldError(key, value[0])
    }
  }
}
const isValidFile = (file: any) => file instanceof File || file instanceof Blob
</script>

<template>
  <form method="POST" action="" class="w-full pb-16">
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
            {{ $t('Site Logo') }}
          </BaseHeading>
          <BaseText size="xs" class="text-muted-400">
            {{ $t('This is the logo that will be displayed on your site') }}
          </BaseText>
        </div>
      </div>
      <div class="px-8">
        <div class="mx-auto space-y-12 py-8">
          <BaseMessage v-if="success" @close="success = false">
            <span class="text-gray-700 dark:text-gray-300"
              >{{ $t('Your settings have been saved') }}!</span
            >
          </BaseMessage>
          <BaseMessage
            v-if="fieldsWithErrors"
            type="danger"
            @close="() => setErrors({})"
          >
            {{ $t('The file you uploaded is not valid') }}
          </BaseMessage>

          <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <TairoFormGroup
              label="Logo"
              sublabel="This is the logo that will be displayed on your site"
            >
              <div
                class="relative flex flex-col items-center justify-center gap-4"
              >
                <BaseInputFileHeadless
                  accept="image/*"
                  v-model="logoFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div class="relative h-16 w-16">
                    <img
                      v-if="files?.length && isValidFile(files[0])"
                      :src="preview(files[0]).value"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-16 rounded-full object-cover object-center"
                    />
                    <img
                      v-else
                      :src="settings.logo"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-16 rounded-full object-cover object-center"
                    />
                    <div
                      v-if="files?.length && isValidFile(files[0])"
                      class="absolute bottom-0 end-0 z-20"
                    >
                      <BaseButtonIcon
                        condensed
                        shape="full"
                        @click="remove(files.item(0)!)"
                        data-nui-tooltip="Remove image"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                    <div v-else class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Upload image">
                        <BaseButtonIcon condensed shape="full" @click="open">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                </BaseInputFileHeadless>
                <div
                  v-if="fileError"
                  class="text-danger-600 inline-block font-sans text-[.8rem]"
                >
                  {{ fileError }}
                </div>
              </div>
            </TairoFormGroup>

            <TairoFormGroup
              label="Dark Logo"
              sublabel="This is the dark logo that will be displayed on your site"
            >
              <div
                class="relative flex flex-col items-center justify-center gap-4"
              >
                <BaseInputFileHeadless
                  accept="image/*"
                  v-model="dark_logoFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div class="relative h-16 w-16">
                    <img
                      v-if="files?.length && isValidFile(files[0])"
                      :src="preview(files.item(0)!).value"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-16 rounded-full object-cover object-center"
                    />
                    <img
                      v-else
                      :src="settings.dark_logo"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-16 rounded-full object-cover object-center"
                    />
                    <div
                      v-if="files?.length && isValidFile(files[0])"
                      class="absolute bottom-0 end-0 z-20"
                    >
                      <BaseButtonIcon
                        condensed
                        shape="full"
                        @click="remove(files.item(0)!)"
                        data-nui-tooltip="Remove image"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                    <div v-else class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Upload image">
                        <BaseButtonIcon condensed shape="full" @click="open">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                </BaseInputFileHeadless>
                <div
                  v-if="fileError"
                  class="text-danger-600 inline-block font-sans text-[.8rem]"
                >
                  {{ fileError }}
                </div>
              </div>
            </TairoFormGroup>
            <TairoFormGroup
              label="Full Logo"
              sublabel="This is the full logo that will be displayed on your site"
            >
              <div
                class="relative flex flex-col items-center justify-center gap-4"
              >
                <BaseInputFileHeadless
                  accept="image/*"
                  v-model="full_logoFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div class="relative h-16 w-64">
                    <img
                      v-if="files?.length && isValidFile(files[0])"
                      :src="preview(files.item(0)!).value"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-64 rounded-lg object-cover object-center"
                    />
                    <img
                      v-else
                      :src="settings.full_logo"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-64 rounded-lg object-cover object-center"
                    />
                    <div
                      v-if="files?.length && isValidFile(files[0])"
                      class="absolute bottom-0 end-0 z-20"
                    >
                      <BaseButtonIcon
                        condensed
                        shape="full"
                        @click="remove(files.item(0)!)"
                        data-nui-tooltip="Remove image"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                    <div v-else class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Upload image">
                        <BaseButtonIcon condensed shape="full" @click="open">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                </BaseInputFileHeadless>
                <div
                  v-if="fileError"
                  class="text-danger-600 inline-block font-sans text-[.8rem]"
                >
                  {{ fileError }}
                </div>
              </div>
            </TairoFormGroup>
            <TairoFormGroup
              label="Dark Full Logo"
              sublabel="This is the dark full logo that will be displayed on your site"
            >
              <div
                class="relative flex flex-col items-center justify-center gap-4"
              >
                <BaseInputFileHeadless
                  accept="image/*"
                  v-model="dark_full_logoFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div class="relative h-16 w-64">
                    <img
                      v-if="files?.length && isValidFile(files[0])"
                      :src="preview(files.item(0)!).value"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-64 rounded-lg object-cover object-center"
                    />
                    <img
                      v-else
                      :src="settings.dark_full_logo"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-16 w-64 rounded-lg object-cover object-center"
                    />
                    <div
                      v-if="files?.length && isValidFile(files[0])"
                      class="absolute bottom-0 end-0 z-20"
                    >
                      <BaseButtonIcon
                        condensed
                        shape="full"
                        @click="remove(files.item(0)!)"
                        data-nui-tooltip="Remove image"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                    <div v-else class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Upload image">
                        <BaseButtonIcon condensed shape="full" @click="open">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                </BaseInputFileHeadless>
                <div
                  v-if="fileError"
                  class="text-danger-600 inline-block font-sans text-[.8rem]"
                >
                  {{ fileError }}
                </div>
              </div>
            </TairoFormGroup>
            <TairoFormGroup
              label="Card Logo"
              sublabel="This is the card logo that will be displayed on your site social cards"
            >
              <div
                class="relative flex flex-col items-center justify-center gap-4"
              >
                <BaseInputFileHeadless
                  accept="image/*"
                  v-model="card_logoFile"
                  v-slot="{ open, remove, preview, files }"
                >
                  <div class="relative h-64 w-64">
                    <img
                      v-if="files?.length && isValidFile(files[0])"
                      :src="preview(files.item(0)!).value"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-64 w-64 rounded-lg object-cover object-center"
                    />
                    <img
                      v-else
                      :src="settings.card_logo"
                      alt="Upload preview"
                      class="bg-muted-200 dark:bg-muted-700/60 h-64 w-64 rounded-lg object-cover object-center"
                    />
                    <div
                      v-if="files?.length && isValidFile(files[0])"
                      class="absolute bottom-0 end-0 z-20"
                    >
                      <BaseButtonIcon
                        condensed
                        shape="full"
                        @click="remove(files.item(0)!)"
                        data-nui-tooltip="Remove image"
                      >
                        <Icon name="lucide:x" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                    <div v-else class="absolute bottom-0 end-0 z-20">
                      <div class="relative" data-nui-tooltip="Upload image">
                        <BaseButtonIcon condensed shape="full" @click="open">
                          <Icon name="lucide:plus" class="h-4 w-4" />
                        </BaseButtonIcon>
                      </div>
                    </div>
                  </div>
                </BaseInputFileHeadless>
                <div
                  v-if="fileError"
                  class="text-danger-600 inline-block font-sans text-[.8rem]"
                >
                  {{ fileError }}
                </div>
              </div>
            </TairoFormGroup>
          </div>
        </div>
      </div>
    </BaseCard>
  </form>
</template>
