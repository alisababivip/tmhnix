<script setup lang="ts">
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useIcoProjectStore } from '~~/store/extensions/ico/admin/projects'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  title: 'Create ICO Project',
  permissions: ['Create ICO Projects'],
})
const { toast } = useUtils()
const router = useRouter()

const icoProjectStore = useIcoProjectStore()
const { createIcoProject } = useIco()

onMounted(async () => {})

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nonempty('Description is required'),
  website: z.string().nonempty('Website is required'),
  whitepaper: z.string().nonempty('Whitepaper is required'),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  description: '',
  website: '',
  whitepaper: '',
  status: 'PENDING',
}))

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Image File Handling
const imageFile = ref<FileList | null>(null)
const imagePreviewUrl = ref<string | null>(null)

watch(imageFile, (value) => {
  const file = value?.item(0) || null
  if (imageFile.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
})

// Create Method
const create = handleSubmit(async (values: FormInput) => {
  try {
    let data = {
      ...values,
      image: '',
    }

    if (imageFile.value) {
      // Create FormData for file upload
      const body = new FormData()
      body.append('files', imageFile.value[0])
      body.append('type', 'icoProject')

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

    const response = await createIcoProject(
      data.name,
      data.description,
      data.website,
      data.whitepaper,
      data.image,
      data.status,
    )
    toast.response(response)
    if (response.status === 'success') {
      await icoProjectStore.fetchIcoProjects()
      router.push('/admin/extensions/ico/projects')
    }
  } catch (error) {
    toast.danger(error as any)
  }
})
</script>

<template>
  <TairoContentWrapper>
    <template #left>
      <BaseHeading size="lg">{{ $t('Create ICO Project') }}</BaseHeading>
    </template>
    <template #right>
      <BaseButton
        type="button"
        color="muted"
        class="hover:bg-gray-300 dark:hover:bg-gray-800"
        to="/admin/extensions/ico/projects"
      >
        <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
        {{ $t('Back') }}
      </BaseButton>
      <BaseButton
        type="submit"
        color="primary"
        :disabled="isSubmitting"
        class="w-full"
        @click="create"
      >
        {{ $t('Create Project') }}
      </BaseButton>
    </template>
    <form @submit="create" class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BaseCard class="p-5 space-y-5">
          <!-- Name -->
          <Field
            name="name"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Name"
              placeholder="Enter name"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <!-- Website -->
          <Field
            name="website"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              label="Website"
              placeholder="Enter website"
              shape="rounded"
              class="w-full"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </BaseCard>

        <BaseCard class="p-5">
          <!-- Image Upload Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div
              v-if="imagePreviewUrl"
              class="mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"
            >
              <img
                :src="imagePreviewUrl"
                alt="Image Preview"
                class="max-h-full max-w-full object-cover object-center"
              />
            </div>
          </div>
        </BaseCard>
      </div>
      <BaseCard class="p-5">
        <Field
          name="status"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseListbox
            :model-value="field.value"
            :error="errorMessage"
            :items="['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']"
            placeholder="Select a status"
            label="Status"
            shape="rounded"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>

      <BaseCard class="p-5">
        <!-- Description -->
        <Field
          name="description"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Description"
            shape="rounded"
            placeholder="Write a description"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>
      <BaseCard class="p-5">
        <!-- Whitepaper -->
        <Field
          name="whitepaper"
          v-slot="{ field, errorMessage, handleChange, handleBlur }"
        >
          <BaseTextarea
            v-model="field.value"
            :error="errorMessage"
            label="Whitepaper"
            shape="rounded"
            placeholder="Write a whitepaper"
            class="w-full"
            @update:model-value="handleChange"
            @blur="handleBlur"
          />
        </Field>
      </BaseCard>

      <TairoFormSave>
        <BaseButton
          type="submit"
          color="primary"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ $t('Create Project') }}
        </BaseButton>
      </TairoFormSave>
    </form>
  </TairoContentWrapper>
</template>
