<script setup lang="ts">
import { useCategoryStore } from '~~/store/blog/category'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import type { Category } from '~~/types'

definePageMeta({
  permissions: ['Access Blog Categories'],
  title: 'Categories Management',
})
const categoryStore = useCategoryStore()
const route = useRoute()
const { toast } = useUtils()

const { updateCategory, deleteCategory, createCategory } = useBlog()

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const router = useRouter()
const oldFilter = ref('')
const categories = computed(() => categoryStore.categories as Category[])

onMounted(async () => {
  loading.value = true

  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }

  loading.value = false
})

const items = computed(() =>
  categories.value
    .filter((category) => {
      // Reference ID Filter
      if (
        filter.value &&
        filter.value !== '' &&
        filter.value !== undefined &&
        filter.value !== oldFilter.value
      ) {
        router.push({
          query: {
            ...route.query,
            page: '1',
            filter: filter.value,
          },
        })
        oldFilter.value = filter.value
      }
      return !filter.value || category.name?.includes(filter.value)
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
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

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  categoryStore.selectedCategory = item
  isDeleteOpen.value = true
}

async function deletePost() {
  isDeleting.value = true
  try {
    const response = await deleteCategory(categoryStore.selectedCategory?.id)
    toast.response(response)
    if (response.status === 'success') {
      categoryStore.categories = categoryStore.categories.filter(
        (category) => category.id !== categoryStore.selectedCategory?.id,
      )
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  categoryStore.selectedCategory = null
}

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  slug: z.string().nonempty('Slug is required'),
  description: z.string().nonempty('Description is required'),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  slug: '',
  description: '',
}))
const { isSubmitting, setFieldValue, handleSubmit } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Edit
const isEditOpen = ref(false)
function openEditModal(content: any) {
  categoryStore.selectedCategory = content
  setFieldValue('name', content.name)
  setFieldValue('slug', content.slug)
  setFieldValue('description', content.description)
  imagePreviewUrl.value = content.image
  isEditOpen.value = true
}

const editPost = handleSubmit(async (values: FormInput) => {
  if (values.slug !== categoryStore.selectedCategory?.slug) {
    const slugExists = categoryStore.categories.find(
      (category) => category.slug === values.slug,
    )
    if (slugExists) {
      toast.dangerText('Slug already exists')
      return
    }
  }

  let data = {
    ...values,
    image: categoryStore.selectedCategory?.image,
  }

  if (imageFile.value) {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', imageFile.value[0])
    body.append('type', 'blogCategory')
    body.append('oldImagePath', categoryStore.selectedCategory?.image || '')

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

  isSubmitting.value = true
  try {
    const response = await updateCategory(
      categoryStore.selectedCategory?.id,
      data,
    )
    categoryStore.categories = categoryStore.categories.map((category) => {
      if (category.id === categoryStore.selectedCategory?.id) {
        return {
          ...category,
          ...data,
        }
      }
      return category
    })
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
  isSubmitting.value = false
  categoryStore.selectedCategory = null
})

// Create
const isCreateOpen = ref(false)
function openCreateModal() {
  isCreateOpen.value = true
}

const createPost = handleSubmit(async (values: FormInput) => {
  const slugExists = categoryStore.categories.find(
    (category) => category.slug === values.slug,
  )
  if (slugExists) {
    toast.dangerText('Slug already exists')
    return
  }

  let data = {
    ...values,
    image: '',
  }

  if (imageFile.value) {
    // Create FormData for file upload
    const body = new FormData()
    body.append('files', imageFile.value[0])
    body.append('type', 'blogCategory')

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

  isSubmitting.value = true
  try {
    const response = await createCategory(data)
    categoryStore.categories.push(response.data.result)
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
  isSubmitting.value = false
  categoryStore.selectedCategory = null
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Search Category Name..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <template #right>
        <div class="w-full">
          <BaseButton
            color="primary"
            flavor="solid"
            @click="openCreateModal"
            :disabled="isSubmitting"
            :loading="isSubmitting"
          >
            <Icon name="line-md:plus" class="me-2 block h-5 w-5" />
            {{ $t('Create') }} {{ $t('Category') }}
          </BaseButton>
        </div>
      </template>
      <div>
        <template v-if="!loading && paginatedItems?.length === 0">
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
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="Category"
                    :hide-label="index > 0"
                    :picture="item.image || '/img/placeholder.png'"
                    :title="item.name"
                    :subtitle="item.slug"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Posts"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    {{ item.post?.length || 0 }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-20 xs:justify-end xs:w-full"
                  >
                    <BaseDropdown
                      flavor="context"
                      label="Dropdown"
                      orientation="end"
                    >
                      <BaseDropdownItem
                        :to="`/blog/categories/${item.slug}`"
                        title="View Category"
                      >
                        <template #start>
                          <Icon
                            name="ph:eye-duotone"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>

                      <BaseDropdownItem
                        @click="openEditModal(item)"
                        title="Edit Category"
                      >
                        <template #start>
                          <Icon
                            name="line-md:edit-twotone"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>

                      <BaseDropdownItem
                        @click="openDeleteModal(item)"
                        title="Delete Category"
                      >
                        <template #start>
                          <Icon
                            name="line-md:close"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>
                    </BaseDropdown>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Category') }}
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
            {{ $t('Do you really want to delete this') }} {{ $t('category') }}
            {{ $t('This process cannot be undone') }}.
            {{ $t('This will alse delete all the posts under this category') }}.
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
              @click="deletePost()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal :open="isEditOpen" size="xl" @close="isEditOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit') }} {{ $t('Category') }}
          </h3>

          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please update the') }} {{ $t('category') }}
            {{ $t('details') }}.
          </p>

          <div class="grid gap-5 grid-cols-2">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="name"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Name"
                placeholder="Write a name"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="slug"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Slug"
                placeholder="Write a slug"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <div class="col-span-2">
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="description"
              >
                <BaseTextarea
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="text"
                  label="Description"
                  placeholder="Write a description ..."
                  shape="curved"
                  class="w-full"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full col-span-2"
            >
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
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isEditOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="editPost"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>

    <TairoModal :open="isCreateOpen" size="xl" @close="isCreateOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create') }} {{ $t('Category') }}
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
            {{ $t('Please enter the') }} {{ $t('category') }}
            {{ $t('details') }}.
          </p>

          <div class="grid gap-5 grid-cols-2">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="name"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Name"
                placeholder="Write a name"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="slug"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="text"
                label="Slug"
                placeholder="Write a slug"
                shape="curved"
                :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <div class="col-span-2">
              <Field
                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                name="description"
              >
                <BaseTextarea
                  v-model="field.value"
                  :error="errorMessage"
                  :disabled="isSubmitting"
                  type="text"
                  label="Description"
                  placeholder="Write a description ..."
                  shape="curved"
                  class="w-full"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full col-span-2"
            >
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
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="createPost"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
