<script setup lang="ts">
import { useAuthorStore } from '~~/store/blog/author'
import type { Author } from '~~/types'

definePageMeta({
  permissions: ['Access Blog Authors'],
  title: 'Authors Management',
})

const authorStore = useAuthorStore()
const route = useRoute()
const { toast } = useUtils()
const { updateAuthor, deleteAuthor } = useBlog()

const statusParam = computed(() => route.query.status as string | undefined)

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const router = useRouter()
const oldFilter = ref('')
const authors = computed(() => authorStore.authors as Author[])

onMounted(async () => {
  loading.value = true

  if (authorStore.authors.length === 0) {
    await authorStore.fetchAuthors(true, statusParam.value)
  }

  loading.value = false
})

const items = computed(() =>
  authors.value
    .filter((author) => {
      // Status Filter
      if (
        selectedStatus.value &&
        selectedStatus.value !== 'All' &&
        author.status !== selectedStatus.value
      )
        return false

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
      return !filter.value || author.user.uuid?.includes(filter.value)
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

const status = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'REJECTED':
      return 'danger'
    default:
      return 'info'
  }
}

// Filter variables
const filters = ref(false)
const selectedStatus = ref('')

const authorStatus = ['All', 'APPROVED', 'PENDING', 'REJECTED']
const authorStatusUpdate = ['APPROVED', 'PENDING', 'REJECTED']
const isSubmitting = ref(false)
const authorSelectedStatus = ref('')

const numberOfFiltersToShow = computed(() => {
  let filtersCount = 1
  if (statusParam.value) filtersCount--
  return filtersCount
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  authorStore.selectedAuthor = item
  isDeleteOpen.value = true
}

async function deletePost() {
  isDeleting.value = true
  try {
    const response = await deleteAuthor(authorStore.selectedAuthor?.id)
    toast.response(response)
    if (response.status === 'success') {
      await authorStore.fetchAuthors(true)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  authorStore.selectedAuthor = null
}

// Edit
const isEditOpen = ref(false)
function openEditModal(content: any) {
  authorStore.selectedAuthor = content
  authorSelectedStatus.value = content.status
  isEditOpen.value = true
}

const editPost = async () => {
  isSubmitting.value = true
  try {
    const response = await updateAuthor(
      authorStore.selectedAuthor?.id,
      authorSelectedStatus.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      await authorStore.fetchAuthors(true)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
  isSubmitting.value = false
  authorStore.selectedAuthor = null
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <div class="w-full flex gap-2 xs:flex-col sm:flex-row">
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
            placeholder="Search Post Title..."
          />
          <BaseButton @click="filters = !filters" color="muted" block>
            <Icon v-if="filters" name="line-md:arrow-up" class="h-4 w-4 mr-2" />
            <Icon v-else name="line-md:arrow-down" class="h-4 w-4 mr-2" />
            {{ $t('Filters') }}
          </BaseButton>
        </div>
      </template>
      <template #right>
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
      <div>
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <BaseCard
            :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${numberOfFiltersToShow} lg:grid-cols-${
              numberOfFiltersToShow + 2
            } mb-6 p-5`"
            v-if="filters"
          >
            <!-- Status Dropdown -->
            <BaseListbox
              v-if="!statusParam"
              v-model="selectedStatus"
              label="Status"
              :items="authorStatus"
              placeholder="Select a Status"
            />
          </BaseCard>
        </TransitionGroup>
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
                    label="Author"
                    :hide-label="index > 0"
                    :logo="item.user?.avatar"
                    :title="`${item.user?.first_name} ${item.user?.last_name}`"
                    :subtitle="item.user?.uuid"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Posts"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    {{ item.posts?.length || 0 }}
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      :color="status(item.status)"
                      flavor="pastel"
                      condensed
                      >{{ item.status }}</BaseTag
                    >
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
                        @click="openEditModal(item)"
                        title="Edit Author Status"
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
                        title="Delete Author"
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

    <TairoModal :open="isEditOpen" size="sm" @close="isEditOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit') }} {{ $t('Author') }}
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
            {{ $t('Please update the') }} {{ $t('author') }} {{ $t('status') }}.
          </p>

          <div class="space-y-2">
            <BaseListbox
              v-model="authorSelectedStatus"
              :disabled="isSubmitting"
              :items="authorStatusUpdate"
              placeholder="Please select an option"
              label="Status"
              shape="rounded"
            />
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

    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Author') }}
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
            {{ $t('Do you really want to delete this') }} {{ $t('author') }}
            {{ $t('This process cannot be undone') }}.
            {{
              $t(
                'This will also delete all the posts associated with this author',
              )
            }}.
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
  </div>
</template>
