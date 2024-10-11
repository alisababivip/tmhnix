<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import BadWords from 'bad-words'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

import suneditor from 'suneditor'
import 'suneditor/dist/css/suneditor.min.css'
import plugins from 'suneditor/src/plugins'

definePageMeta({
  title: 'Page Editor',
  permissions: ['Access Page Editor'],
})

const pageStore = usePageStore()

// Get query parameters
const route = useRoute()
const type = route.query.type as string
const slug = route.query.slug as string

// Determine the mode (new or edit)
const isEditMode = ref(type === 'edit')

// Initialize bad-words filter
const filter = new BadWords()

// Zod Schema
const zodSchema = z.object({
  title: z
    .string()
    .min(3, 'The title must be at least 2 characters long')
    .refine(
      (value) => !filter.isProfane(value),
      'The title contains blacklisted words',
    ),
  content: z
    .string()
    .min(500, 'The content must be at least 500 characters long')
    .refine(
      (value) => !filter.isProfane(value),
      'The content contains blacklisted words',
    ),
  description: z
    .string()
    .min(100, 'The description must be at least 100 characters long')
    .refine(
      (value) => !filter.isProfane(value),
      'The description contains blacklisted words',
    ),
  status: z.string().optional(),
})

// Form Input Type
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)

// Initial Values
const initialValues = ref<FormInput>({
  title: '',
  content: '',
  description: '',
  status: 'DRAFT',
})

const statusOptions = ['DRAFT', 'PUBLISHED']

// Setup Form with Vee Validate
const {
  handleSubmit,
  isSubmitting,
  meta,
  errors,
  values,
  setErrors,
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues,
})

const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(null)

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

const isFormIncomplete = computed(() => {
  return !values.title || !values.content || errors.title || errors.content
})

const editorInstance = ref(null)
const viewport = useViewport()
onMounted(async () => {
  if (pageStore.pages.length === 0) {
    await pageStore.fetchPages()
  }
  pageStore.currentPage = pageStore.getPageBySlug(slug)

  let buttonsList
  if (viewport.isGreaterOrEquals('sm')) {
    buttonsList = [
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['paragraphStyle', 'blockquote'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle'],
      ['removeFormat'],
      ['outdent', 'indent'],
      ['align', 'horizontalRule', 'list', 'lineHeight'],
      ['table', 'link', 'image', 'video', 'audio'],
      ['fullScreen', 'showBlocks', 'codeView'],
    ]
  } else {
    buttonsList = [
      ['font', 'fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
    ]
  }

  editorInstance.value = suneditor.create('editor', {
    plugins: plugins,
    charCounter: true,
    resizingBar: true,
    imageFileInput: false,
    buttonList: buttonsList,
  })

  if (isEditMode.value) {
    // Set the initial values using the post data
    initialValues.value = {
      title: pageStore.currentPage.title,
      content: pageStore.currentPage.content,
      description: pageStore.currentPage.description,
      status: pageStore.currentPage.status,
    }

    // Set image preview URL
    imagePreviewUrl.value = pageStore.currentPage.image

    editorInstance.value.setContents(pageStore.currentPage.content)
  }

  editorInstance.value.onBlur = function (e, core) {
    setFieldValue('content', e.srcElement.innerHTML)
  }
})

onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.destroy()
  }
})

onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const { toast } = useUtils()

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

const { createPage, updatePage } = usePages()

const existingImageUrl = computed(() => {
  if (isEditMode.value) {
    return pageStore.currentPage.image
  }
  return ''
})
// Handle Form Submission

const onSubmit = handleSubmit(async (values: FormInput) => {
  try {
    // Initialize the success flag
    success.value = false

    const data = {
      title: values.title,
      content: values.content,
      description: values.description,
      status: values.status,
      image: isEditMode.value && !imageFile.value ? existingImageUrl.value : '',
    }

    // Check if there is a new file to upload
    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'page')
      if (isEditMode.value && existingImageUrl.value) {
        body.append('oldImagePath', existingImageUrl.value)
      }

      // Upload the file
      const uploadResponse = await useFetch('/api/upload', {
        method: 'POST',
        body,
      })

      // Check if the upload was successful and get the URL
      if (uploadResponse && uploadResponse.data.value !== '') {
        // Set the new image URL in the form values
        data.image = uploadResponse.data.value[0]
      }
    }

    let response

    if (isEditMode.value) {
      // Update the post if in edit mode
      response = await updatePage(pageStore.currentPage?.id, data)
    } else {
      // Create a new post if in new mode
      response = await createPage(data)
    }

    toast.response(response)

    // Rest of the code remains the same...
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
          {{
            isEditMode
              ? `Editing ${pageStore.currentPage?.title} page`
              : 'Create a new page'
          }}
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
          <a :href="`/page/${slug}`" target="_blank" class="w-full">
            <BaseButton
              v-if="isEditMode"
              color="info"
              class="flex items-center w-full"
            >
              <Icon name="mdi-light:eye" class="h-5 w-5" />
              <span>{{ $t('View') }}</span>
            </BaseButton></a
          >
          <BaseButton
            :color="isEditMode ? 'success' : 'primary'"
            class="flex items-center gap-2"
            :disabled="isFormIncomplete"
            @click="onSubmit"
          >
            <Icon name="mdi-light:content-save" class="h-5 w-5" />
            <span>{{ isEditMode ? 'Update' : 'Publish' }}</span>
          </BaseButton>
        </div>
      </template>
      <div class="mb-4">
        <BaseMessage v-if="success" @close="success = false">
          {{ $t('Your post has been published') }}!
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
      <div class="flex flex-col sm:flex-row w-full gap-5">
        <!-- Left Side (3/4) -->
        <div class="w-full sm:w-3/4 space-y-3">
          <!-- Title -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="title"
          >
            <BaseInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              shape="rounded"
              placeholder="Enter post title"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Post Title"
            />
          </Field>

          <!-- Content -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="content"
          >
            <BaseTextarea
              id="editor"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              shape="rounded"
              rows="15"
              placeholder="Enter post content"
              color-focus
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Content"
            />
          </Field>
          <!-- Description -->
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="description"
          >
            <BaseTextarea
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              shape="rounded"
              rows="3"
              placeholder="Enter post description"
              color-focus
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Description"
            />
          </Field>
        </div>
        <!-- Right Side (1/4) -->
        <div class="w-full sm:w-1/4 mt-6">
          <!-- Category and Tags Selection Card -->
          <BaseCard shape="rounded" class="p-4 mb-5 space-y-5">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="status"
            >
              <BaseListbox
                :model-value="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                :items="statusOptions"
                placeholder="Please select a status"
                label="Status"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </BaseCard>
          <!-- Image Selection Card -->
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
                        <BaseProgress :value="0" size="xs" :color="'success'" />
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
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
