<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useForexSignalStore } from '~~/store/extensions/forex/admin/signals'

definePageMeta({
  permissions: ['View Forex Signals'],
  title: 'Forex Signals',
})

// General Constants
const { toast } = useUtils()
const route = useRoute()
const loading = ref(true)
const { createForexSignal, deleteForexSignal } = useForex()
const forexSignalStore = useForexSignalStore()
const signals = computed(() => forexSignalStore.signals)

onMounted(async () => {
  loading.value = true
  if (forexSignalStore.signals.length === 0) {
    await forexSignalStore.fetchForexSignals()
  }
  loading.value = false
})

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isCreateOpen = ref(false)

// Filter
const filteredItems = computed(() => {
  if (signals.value && Array.isArray(signals.value)) {
    return signals.value.filter((item) =>
      item.title.toLowerCase().includes(filter.value.toLowerCase()),
    )
  } else {
    return []
  }
})

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredItems.value.slice(start, end)
})

// Validation
const zodSchema = z.object({
  title: z.string().nonempty('Title cannot be empty'),
  status: z.boolean(),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  title: '',
  status: true,
}))

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
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

// Create
const create = handleSubmit(async (values) => {
  if (
    signals.value &&
    signals.value.length > 0 &&
    signals.value.some((item) => item.title === values.title)
  ) {
    toast.warning('Signal already exists')
    isCreateOpen.value = false
    return
  }
  const data = {
    title: values.title,
    image: '',
    status: values.status ? 'ACTIVE' : 'INACTIVE',
  }
  if (imageFile.value) {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', imageFile.value[0])
    body.append('type', 'forexSignal')

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
  try {
    const response = await createForexSignal(
      data.title,
      data.image,
      data.status,
    )
    toast.response(response)
    if (response.status === 'success') {
      await forexSignalStore.fetchForexSignals()
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deletePlan() {
  isDeleting.value = true
  try {
    const response = await deleteForexSignal(selectedItem.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      forexSignalStore.removeSignal(selectedItem.value?.id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}
</script>

<template>
  <div class="pb-10">
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter signals..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <div class="w-full">
          <BaseButton
            color="success"
            class="w-full"
            @click="isCreateOpen = true"
            flavor="outline"
          >
            <Icon name="line-md:plus" class="h-4 w-4" />
            <span>{{ $t('Create Signal') }}</span>
          </BaseButton>
        </div>
      </template>
      <div>
        <div v-if="loading" class="space-y-4">
          <BaseCard
            v-for="index in 3"
            :key="index"
            class="flex flex-col p-5 sm:flex-row sm:items-center"
          >
            <div
              class="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
            >
              <BasePlaceload class="h-16 w-16 shrink-0 rounded-full" />
              <div class="space-y-2">
                <BasePlaceload
                  class="mx-auto h-3 w-[100px] rounded-lg sm:mx-0"
                />
                <BasePlaceload
                  class="mx-auto h-3 w-[75px] rounded-lg sm:mx-0"
                />
              </div>
            </div>
            <div
              class="flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"
            >
              <div
                class="flex w-full items-center justify-center sm:w-[160px] sm:justify-end"
              >
                <BasePlaceload class="h-6 w-24 rounded-full" />
              </div>
              <div
                class="ptablet:hidden divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
              >
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
                <div class="flex flex-col gap-1 px-4 text-center">
                  <BasePlaceload class="h-3 w-16 rounded-lg" />
                </div>
              </div>
              <div
                class="ptablet:hidden flex w-full items-center justify-center gap-1 py-3 sm:w-[160px] sm:justify-end sm:py-0"
              >
                <BasePlaceload class="h-8 w-8 shrink-0 rounded-full" />
                <BasePlaceload class="h-8 w-8 shrink-0 rounded-full" />
                <BasePlaceload class="hidden h-3 w-12 rounded-full sm:block" />
              </div>
              <div class="sm:ms-6">
                <BasePlaceload
                  class="mx-auto h-8 w-40 rounded-lg sm:mx-0 sm:w-20"
                />
              </div>
            </div>
          </BaseCard>
        </div>
        <div v-else-if="!loading && paginatedItems.length === 0">
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any data here yet.'
            "
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-1.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-1-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else class="space-y-4">
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard
              v-for="item in paginatedItems"
              :key="item.id"
              class="flex flex-col p-5 sm:flex-row sm:items-center"
            >
              <div
                class="flex flex-col items-center justify-start gap-3 text-center sm:flex-row sm:justify-start sm:text-left"
              >
                <img :src="item.image" class="h-16 w-16 shrink-0 rounded-lg" />
                <BaseHeading
                  tag="h3"
                  size="sm"
                  weight="medium"
                  class="text-muted-800 dark:text-muted-100"
                >
                  {{ item.title }}
                </BaseHeading>
              </div>
              <div
                class="flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"
              >
                <div
                  class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                >
                  <div class="flex flex-col gap-1 px-4 text-center">
                    <BaseHeading
                      tag="h3"
                      size="md"
                      weight="semibold"
                      class="text-muted-800 dark:text-muted-100"
                    >
                      <span>{{ item.forex_accounts?.length ?? 0 }}</span>
                    </BaseHeading>
                    <BaseParagraph
                      lead="none"
                      weight="semibold"
                      class="text-muted-400 !text-[0.65rem] uppercase"
                    >
                      <span>{{ $t('Plans') }}</span>
                    </BaseParagraph>
                  </div>
                  <div>
                    <TairoButtonIcon
                      @click="openDeleteModal(item)"
                      color="danger"
                      flavor="outline"
                      data-nui-tooltip="Delete Signal"
                      condensed
                      class="ml-4"
                    >
                      <Icon name="line-md:close" class="h-4 w-4" />
                    </TairoButtonIcon>
                  </div>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
          <div>
            <BasePagination
              v-if="signals.length > perPage"
              :total-items="signals.length"
              :item-per-page="perPage"
              :current-page="page"
              shape="full"
            />
          </div>
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isCreateOpen" size="xl" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Signal') }}
          </h3>

          <BaseButtonClose @click="isCreateOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              $t(
                'Please provide a unique signal and timeframe for the new signal',
              )
            }}.
          </p>
          <div class="space-y-5">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="title"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="title"
                placeholder="Enter title"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

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

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="status"
            >
              <BaseSwitchThin
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Status"
                color="success"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="create"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Forex Signal') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete this') }}
            {{ $t('signal') }}
            {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deletePlan()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
