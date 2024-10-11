<script setup lang="ts">
import { useAdminEcommerceReviewsStore } from '~~/store/extensions/ecommerce/admin/reviews'

definePageMeta({
  permissions: ['View Ecommerce Reviews'],
  title: 'Ecommerce Reviews',
})

const adminReviewsStore = useAdminEcommerceReviewsStore()
const { deleteAdminReview } = useEcommerce()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(
  () =>
    adminReviewsStore.reviews.filter(
      (item) => item.product?.name.includes(filter.value),
    ) ?? [],
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (adminReviewsStore.reviews.length === 0) {
    adminReviewsStore.loading = true
    await adminReviewsStore.fetchReviews()
    adminReviewsStore.loading = false
  }
})

const { toast } = useUtils()
const router = useRouter()

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deleteReviewById() {
  isDeleting.value = true
  try {
    const response = await deleteAdminReview(selectedItem.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      adminReviewsStore.removeReview(selectedItem.value?.id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}

const statusClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'danger'
    default:
      return 'secondary'
  }
}
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
          placeholder="Filter reviews..."
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
      </template>
      <template
        v-if="!adminReviewsStore.loading && paginatedItems.length === 0"
      >
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
      <div v-else class="w-full">
        <TairoFlexTable class="pt-5">
          <TableFlexTableRow
            v-for="(item, index) in paginatedItems"
            :key="item.id"
            spaced
          >
            <template #start>
              <TableFlexTableStart
                label="Reviewer Name"
                :hide-label="index > 0"
                :logo="item.user?.avatar ?? '/img/placeholder.png'"
                :title="`${item.user?.first_name} ${item.user?.last_name}`"
                :subtitle="item.user?.uuid"
              />
            </template>
            <template #end>
              <TableFlexTableCell
                label="Product"
                :hide-label="index > 0"
                class="w-20 xs:w-full text-xs"
                >{{ item.product?.name }}
              </TableFlexTableCell>
              <TableFlexTableCell
                label="Rating"
                :hide-label="index > 0"
                class="w-20 xs:w-full text-xs"
              >
                <div class="flex items-start">
                  <span>{{ item.rating }} / 5</span>
                  <Icon
                    name="uim:star"
                    class="w-5 h-5 text-warning-300 ml-1 mb-1"
                  />
                </div>
              </TableFlexTableCell>
              <TableFlexTableCell
                label="Status"
                :hide-label="index > 0"
                class="w-20 xs:w-full"
              >
                <BaseTag
                  :color="statusClass(item.status)"
                  flavor="pastel"
                  condensed
                  >{{ item.status }}</BaseTag
                >
              </TableFlexTableCell>
              <TableFlexTableCell label="Actions" :hide-label="index > 0">
                <BaseDropdown
                  flavor="context"
                  label="Dropdown"
                  orientation="end"
                >
                  <BaseDropdownItem
                    @click="openDeleteModal(item)"
                    title="Delete Review"
                  >
                    <template #start>
                      <Icon name="line-md:close" class="me-2 block h-5 w-5" />
                    </template>
                    Delete
                  </BaseDropdownItem>
                </BaseDropdown>
              </TableFlexTableCell>
            </template>
          </TableFlexTableRow>
        </TairoFlexTable>
      </div>
      <BasePagination
        v-if="items.length > perPage"
        :total-items="items.length"
        :current-page="page"
        :items-per-page="perPage"
      />
    </TairoContentWrapper>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <template #header>
        <div class="flex items-center justify-between p-4">
          <h3 class="text-lg font-medium leading-6">Delete Review</h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 text-center">
        <h3 class="text-lg font-medium leading-6">Are you sure?</h3>
        <p class="mb-3 text-sm leading-5">
          Do you really want to delete this review? This process cannot be
          undone.
        </p>
      </div>
      <template #footer>
        <div class="p-4 flex gap-x-2">
          <BaseButton @click="isDeleteOpen = false">Cancel</BaseButton>
          <BaseButton
            color="danger"
            flavor="solid"
            @click="deleteReviewById"
            :disabled="isDeleting"
            :loading="isDeleting"
          >
            Delete
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
