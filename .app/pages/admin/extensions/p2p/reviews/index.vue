<script setup lang="ts">
import { useAdminP2PReviewsStore } from '~~/store/extensions/p2p/admin/reviews'
import type { P2PReview } from '~~/types'

definePageMeta({
  permissions: ['View P2P Trade Reviews'],
  title: 'P2P Trade Reviews',
})

const p2pReviewStore = useAdminP2PReviewsStore()
const { deleteAdminP2PReview } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pReviewStore.reviews.filter(
    (review) =>
      review.comment?.toLowerCase().includes(filter.value.toLowerCase()),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pReviewStore.reviews.length === 0) {
    p2pReviewStore.loading = true
    await p2pReviewStore.fetchP2PReviews()
    p2pReviewStore.loading = false
  }
})

const { toast } = useUtils()

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<P2PReview | null>(null)

function openDeleteModal(review: P2PReview) {
  selectedItem.value = review
  isDeleteOpen.value = true
}

async function deleteReview() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    await deleteAdminP2PReview(selectedItem.value.id)
    p2pReviewStore.removeReview(selectedItem.value.id)
    toast.success('Review deleted successfully')
  } catch (error) {
    toast.error('Failed to delete review')
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}
</script>
<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter reviews..."
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{ wrapper: 'w-full sm:w-40' }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <div>
        <template v-if="!p2pReviewStore.loading && paginatedItems.length === 0">
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
              v-for="(review, index) in paginatedItems"
              :key="review.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Review"
                  :hide-label="index > 0"
                  :title="`ID: ${review.id}`"
                  :subtitle="review.comment"
                />
              </template>
              <template #end>
                <TableFlexTableCell label="Rating" :hide-label="index > 0">
                  {{ review.rating }}
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="viewReviewDetails(review)"
                      title="View Details"
                    >
                      <!-- Icon and Label for View -->
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openDeleteModal(review)"
                      title="Delete Review"
                    >
                      <!-- Icon and Label for Delete -->
                    </BaseDropdownItem>
                  </BaseDropdown>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
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
    <TairoModal
      :open="isDeleteOpen"
      size="sm"
      @close="() => (isDeleteOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete Review') }}
          </h3>
          <BaseButtonClose @click="() => (isDeleteOpen = false)" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure you want to delete this review?') }}
          </h3>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isDeleteOpen = false)">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteReview"
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
