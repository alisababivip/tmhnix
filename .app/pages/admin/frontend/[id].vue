<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  title: 'Frontend Editor',
  permissions: ['Access Frontend Editor'],
})

const frontendStore = useFrontendStore()
const { toast } = useUtils()

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// Get query parameters
const route = useRoute()

const { updateFrontendSection, getFrontendSection } = useFrontend()
const router = useRouter()
const sectionId = route.params.id as string
const section = ref(null)

const marketsSchema = z.object({
  heading: z.string(),
  subtext: z.string(),
})

const featureSchema = z.object({
  title: z.string(),
  description: z.string(),
})

const stepSchema = z.object({
  step: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  iconColor: z.string(),
})

const getSchemaForSection = (section: string) => {
  switch (section) {
    case 'banner':
      return z.object({
        heading: z.string(),
        subtext: z.object({
          part1: z.string(),
          part2: z.string(),
        }),
        button: z.string(),
        image: z.string(),
      })
    case 'features':
      return z.object({
        heading: z.string(),
        subtext: z.object({
          part1: z.string(),
          part2: z.string(),
        }),
        features: z.array(featureSchema),
        image: z.string(),
      })
    case 'markets':
      return marketsSchema
    case 'steps':
      return z.object({
        heading: z.string(),
        steps: z.array(stepSchema),
      })
    default:
      throw new Error(`Unsupported section: ${section}`)
  }
}

type FormInput = z.infer<typeof zodSchema>

// Initial Values
const initialValues = ref<FormInput>({
  content: null,
})

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const dynamicValidationSchema = ref(z.object({}))

// A ref to store whether the form schema is ready
const isSchemaReady = ref(false)

const {
  handleSubmit,
  isSubmitting,
  meta,
  errors,
  values,
  setErrors,
  setFieldValue,
} = useForm({
  validationSchema: computed(() => {
    if (isSchemaReady.value && dynamicValidationSchema.value) {
      return toTypedSchema(dynamicValidationSchema.value)
    }
    return null
  }),
  initialValues,
})

// Watch for changes in the image file input
watch(imageFile, (value) => {
  const file = value?.item(0) || null
  if (imageFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string // Set the preview URL
    }
    reader.readAsDataURL(file)
  }
})

onMounted(async () => {
  try {
    const response = await getFrontendSection(sectionId)
    if (response.status !== 'success') {
      router.replace('/admin/settings/frontend')
      return
    }
    section.value = response.data.result
    // Update the dynamic validation schema
    dynamicValidationSchema.value = await getSchemaForSection(
      response.data.result.section,
    )
    isSchemaReady.value = true

    // Update initial values
    initialValues.value = {
      content: section.value?.content,
    }

    imagePreviewUrl.value = section.value?.content?.image || null
  } catch (error) {
    console.error('Failed to fetch data: ', error)
  }
})

const onSubmit = handleSubmit(async (values: FormInput) => {
  try {
    // Initialize the success flag
    success.value = false

    values = {
      ...values.content,
      image: imagePreviewUrl.value || null,
    }

    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'frontend')

      // Upload the file
      const uploadResponse = await useFetch('/api/upload', {
        method: 'POST',
        body,
      })

      // Check if the upload was successful and get the URL
      if (uploadResponse && uploadResponse.data.value !== '') {
        // Set the new image URL in the form values
        values.image = uploadResponse.data.value[0]
      }
    }

    const response = await updateFrontendSection(sectionId, values)
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading
          as="h3"
          size="xl"
          weight="semibold"
          class="text-muted-800 dark:text-white"
        >
          {{ `Editing ${section?.title} page` }}
        </BaseHeading>
      </template>
      <template #right>
        <div class="flex flex-col sm:flex-row gap-2 w-full">
          <BaseButton
            color="muted"
            class="flex items-center gap-2"
            @click="$router.back()"
          >
            <Icon name="mdi-light:arrow-left" class="h-5 w-5" />
            <span>{{ $t('Back') }}</span>
          </BaseButton>
          <BaseButton
            color="success"
            class="flex items-center gap-2"
            @click="onSubmit"
          >
            <Icon name="mdi-light:content-save" class="h-5 w-5" />
            <span>{{ $t('Update') }}</span>
          </BaseButton>
        </div>
      </template>
      <div class="mb-4">
        <BaseMessage v-if="success" @close="success = false">
          {{ $t('Your section has been updated') }}!
        </BaseMessage>
        <BaseMessage
          v-if="fieldsWithErrors > 1"
          type="danger"
          @close="() => setErrors({})"
        >
          {{ $t('This form has') }} {{ fieldsWithErrors }}
          {{ $t('errors, please check them before submitting') }}
        </BaseMessage>
      </div>
      <div class="flex flex-col w-full gap-5">
        <!-- Left Side (3/4) -->
        <template v-for="(value, key) in section?.content" :key="key">
          <template v-if="typeof value === 'object'">
            <!-- Handle nested arrays -->
            <template v-if="Array.isArray(value)">
              <div :key="index" v-for="(arrayItem, index) in value">
                <template v-for="(subValue, subKey) in arrayItem" :key="subKey">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    :name="`content.${key}[${index}].${subKey}`"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      :label="`${key} ${index + 1} ${subKey}`"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                      color-focus
                      class="w-full"
                    />
                  </Field>
                  <small class="text-warning-500" v-if="subKey === 'icon'"
                    >{{ $t('Icon name from ') }}
                    <a
                      class="text-blue-400 underline"
                      href="https://icon-sets.iconify.design/"
                      >https://icon-sets.iconify.design/</a
                    ></small
                  >
                  <small class="text-warning-500" v-if="subKey === 'iconColor'"
                    >{{ $t('Icon colors as ') }}
                    <span class="text-warning-400 mx-1"
                      >text-(color name in small letters)-(density)</span
                    >
                    {{ $t('from') }}
                    <a
                      class="text-blue-400 underline"
                      href="https://tailwindcss.com/docs/customizing-colors"
                      >https://tailwindcss.com/docs/customizing-colors</a
                    ></small
                  >
                </template>
              </div>
            </template>
            <!-- Handle nested objects (not arrays) -->
            <template v-else>
              <template v-for="(subValue, subKey) in value" :key="subKey">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  :name="`content.${key}.${subKey}`"
                >
                  <BaseInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    :label="subKey"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                    color-focus
                    class="w-full"
                  />
                </Field>
              </template>
            </template>
          </template>
          <template v-else>
            <template v-if="key !== 'image'">
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                :name="`content.${key}`"
              >
                <BaseInput
                  :model-value="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  :label="key"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  color-focus
                  class="w-full"
                />
              </Field>
            </template>
            <template v-else>
              <div class="max-w-sm">
                <div v-if="imagePreviewUrl" class="mb-4">
                  <img
                    :src="imagePreviewUrl"
                    alt="Image Preview"
                    class="rounded-xl object-cover object-center"
                  />
                </div>
                <BaseInputFileHeadless
                  v-model="imageFile"
                  v-slot="{ open, remove, preview, drop, files }"
                >
                  <div
                    class=""
                    @dragenter.stop.prevent
                    @dragover.stop.prevent
                    @drop="drop"
                  >
                    <div
                      v-if="!files?.length"
                      class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300"
                      tabindex="0"
                      role="button"
                      @click="open"
                      @keydown.enter.prevent="open"
                    >
                      <div class="p-5 text-center">
                        <Icon
                          name="mdi-light:cloud-upload"
                          class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"
                        />

                        <h4 class="text-muted-400 font-sans text-sm">
                          {{ $t('Drop file to upload') }}
                        </h4>

                        <div>
                          <span
                            class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"
                          >
                            {{ $t('Or') }}
                          </span>
                        </div>

                        <label
                          for="file"
                          class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"
                        >
                          {{ $t('Select Image') }}
                        </label>
                      </div>
                    </div>

                    <ul v-else class="mt-6 space-y-2">
                      <li v-for="file in files" :key="file.name">
                        <div
                          class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"
                        >
                          <div class="flex items-center gap-2">
                            <div class="shrink-0">
                              <img
                                class="h-14 w-14 rounded-xl object-cover object-center"
                                v-if="file.type.startsWith('image')"
                                :src="preview(file).value"
                                alt="Image preview"
                              />

                              <img
                                v-else
                                class="h-14 w-14 rounded-xl object-cover object-center"
                                src="/img/avatars/placeholder-file.png"
                                alt="Image preview"
                              />
                            </div>

                            <div class="font-sans">
                              <span
                                class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"
                              >
                                {{ file.name }}
                              </span>

                              <span class="text-muted-400 block text-xs">
                                {{ formatFileSize(file.size) }}
                              </span>
                            </div>
                          </div>

                          <div
                            class="ms-auto w-32 px-4 transition-opacity duration-300"
                            :class="'opacity-100'"
                          >
                            <BaseProgress
                              :value="0"
                              size="xs"
                              :color="'success'"
                            />
                          </div>

                          <div class="flex gap-2">
                            <button
                              class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled
                              type="button"
                              tooltip="Cancel"
                            >
                              <Icon name="lucide:slash" class="h-4 w-4" />

                              <span class="sr-only">Cancel</span>
                            </button>

                            <button
                              class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                              type="button"
                              tooltip="Upload"
                            >
                              <Icon name="lucide:arrow-up" class="h-4 w-4" />

                              <span class="sr-only">Upload</span>
                            </button>

                            <button
                              class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                              type="button"
                              tooltip="Remove"
                              @click.prevent="remove(file)"
                            >
                              <Icon name="lucide:x" class="h-4 w-4" />

                              <span class="sr-only">Remove</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </BaseInputFileHeadless>
              </div>
            </template>
          </template>
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
