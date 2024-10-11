<script setup lang="ts">
import { useAdminP2POffersStore } from '~~/store/extensions/p2p/admin/offers'
import type { P2POffer } from '~~/types'

definePageMeta({
  permissions: ['View P2P Offers'],
  title: 'P2P Offers',
})

const p2pOfferStore = useAdminP2POffersStore()
const { deleteAdminP2POffer } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pOfferStore.offers.filter(
    (offer) => offer.currency?.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pOfferStore.offers.length === 0) {
    p2pOfferStore.loading = true
    await p2pOfferStore.fetchP2POffers()
    p2pOfferStore.loading = false
  }
})

const { toast } = useUtils()

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<P2POffer | null>(null)

function openDeleteModal(offer: P2POffer) {
  selectedItem.value = offer
  isDeleteOpen.value = true
}

async function deleteOffer() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    await deleteAdminP2POffer(selectedItem.value.id)
    p2pOfferStore.removeOffer(selectedItem.value.id)
    toast.successText('Offer deleted successfully')
  } catch (error) {
    toast.error('Failed to delete offer')
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}
const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'success'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'info'
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
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter offers..."
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
        <template v-if="!p2pOfferStore.loading && paginatedItems.length === 0">
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
                  label="Offer"
                  :hide-label="index > 0"
                  :logo="`/img/crypto/${item.currency.toLowerCase()}.png`"
                  :title="`${item.currency} (${item.wallet_type} Wallet)`"
                  :subtitle="item.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full text-xs"
                  >{{ item.amount }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Price"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full text-xs"
                  >{{ item.price }}
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
                      title="Delete Offer"
                    >
                      <Icon name="line-md:close" class="w-4 h-4 mr-2" />
                      {{ $t('Delete') }}
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
            {{ $t('Delete Offer') }}
          </h3>
          <BaseButtonClose @click="() => (isDeleteOpen = false)" />
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
            {{
              $t(
                'Do you really want to delete this offer? it will refund the amount to the user, This process cannot be undone.',
              )
            }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isDeleteOpen = false)">
              {{ $t('Cancel') }}
            </BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteOffer"
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
