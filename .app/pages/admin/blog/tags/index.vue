<script setup lang="ts">
import { useTagStore } from '~~/store/blog/tag'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

definePageMeta({
  permissions: ['Access Blog Tags'],
  title: 'Tags Management',
})
const tagStore = useTagStore()
const route = useRoute()
const { toast } = useUtils()

const { updateTag, deleteTag, createTag } = useBlog()

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const router = useRouter()
const oldFilter = ref('')
const tags = computed(() => tagStore.tags)

onMounted(async () => {
  loading.value = true

  if (tagStore.tags.length === 0) {
    await tagStore.fetchTags()
  }

  loading.value = false
})

const items = computed(() =>
  tags.value
    .filter((tag) => {
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
      return !filter.value || tag.name?.includes(filter.value)
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

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  tagStore.selectedTag = item
  isDeleteOpen.value = true
}

async function deletePost() {
  isDeleting.value = true
  try {
    const response = await deleteTag(tagStore.selectedTag?.id)
    toast.response(response)
    if (response.status === 'success') {
      tagStore.tags = tagStore.tags.filter(
        (tag) => tag.id !== tagStore.selectedTag?.id,
      )
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  tagStore.selectedTag = null
}

// Validation
const zodSchema = z.object({
  name: z.string().nonempty('Name is required'),
  slug: z.string().nonempty('Slug is required'),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  name: '',
  slug: '',
}))
const { isSubmitting, setFieldValue, handleSubmit } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

// Edit
const isEditOpen = ref(false)
function openEditModal(content: any) {
  tagStore.selectedTag = content
  setFieldValue('name', content.name)
  setFieldValue('slug', content.slug)
  isEditOpen.value = true
}

const editPost = handleSubmit(async (values: FormInput) => {
  if (values.slug !== tagStore.selectedTag?.slug) {
    const slugExists = tagStore.tags.find((tag) => tag.slug === values.slug)
    if (slugExists) {
      toast.dangerText('Slug already exists')
      return
    }
  }

  isSubmitting.value = true
  try {
    const response = await updateTag(tagStore.selectedTag?.id, values)
    tagStore.tags = tagStore.tags.map((tag) => {
      if (tag.id === tagStore.selectedTag?.id) {
        return {
          ...tag,
          ...values,
        }
      }
      return tag
    })
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
  isSubmitting.value = false
  tagStore.selectedTag = null
})

// Create
const isCreateOpen = ref(false)
function openCreateModal() {
  isCreateOpen.value = true
}

const createPost = handleSubmit(async (values: FormInput) => {
  const slugExists = tagStore.tags.find((tag) => tag.slug === values.slug)
  if (slugExists) {
    toast.dangerText('Slug already exists')
    return
  }

  isSubmitting.value = true
  try {
    const response = await createTag(values)
    tagStore.tags.push(response.data.result)
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isCreateOpen.value = false
  isSubmitting.value = false
  tagStore.selectedTag = null
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
          placeholder="Search Tag Name..."
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
            {{ $t('Create') }} {{ $t('Tag') }}
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
                    label="Tag"
                    :hide-label="index > 0"
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
                    {{ item.post_tag?.length || 0 }}
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
                        :to="`/blog/tags/${item.slug}`"
                        title="View Tag"
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
                        title="Edit Tag"
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
                        title="Delete Tag"
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
            {{ $t('Delete') }} {{ $t('Tag') }}
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
            {{ $t('Do you really want to delete this') }} {{ $t('tag') }}
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

    <TairoModal :open="isEditOpen" size="sm" @close="isEditOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit') }} {{ $t('Tag') }}
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
            {{ $t('Please update the') }} {{ $t('tag') }} {{ $t('details') }}.
          </p>

          <div class="space-y-2">
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

    <TairoModal :open="isCreateOpen" size="sm" @close="isCreateOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create') }} {{ $t('Tag') }}
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
            {{ $t('Please enter the') }} {{ $t('tag') }} {{ $t('details') }}.
          </p>

          <div class="space-y-2">
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
