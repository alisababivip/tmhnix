<script setup lang="ts">
import { useUserP2PTradesStore } from '~~/store/extensions/p2p/user/trades'
import type { P2PTrade } from '~~/types'

definePageMeta({
  title: 'P2P Trades',
})

const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const p2pTradeStore = useUserP2PTradesStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pTradeStore.trades.filter(
    (trade) => trade.offer?.currency?.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pTradeStore.trades.length === 0) {
    p2pTradeStore.loading = true
    await p2pTradeStore.fetchP2PTrades()
    p2pTradeStore.loading = false
  }
})

const { toast } = useUtils()

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<P2PTrade | null>(null)

function openDeleteModal(trade: P2PTrade) {
  selectedItem.value = trade
  isDeleteOpen.value = true
}

async function deleteTrade() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    await deleteUserP2PTrade(selectedItem.value.id)
    p2pTradeStore.removeTrade(selectedItem.value.id)
    toast.success('Trade deleted successfully')
  } catch (error) {
    toast.error('Failed to delete trade')
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}

const status = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning' // Trade is open but not yet actioned
    case 'PAID':
      return 'info' // Payment has been made, awaiting further action
    case 'DISPUTE_OPEN':
      return 'danger' // Trade is in dispute
    case 'ESCROW_REVIEW':
      return 'info' // Under review by escrow
    case 'CANCELLED':
      return 'danger' // Trade has been cancelled
    case 'RELEASED':
      return 'primary' // Funds have been released by the seller
    case 'COMPLETED':
      return 'success' // Trade is completed successfully
    case 'REFUNDED':
      return 'secondary' // Trade has been refunded
    default:
      return 'default' // Default status for any other cases
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
          placeholder="Filter trades..."
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
        <template v-if="!p2pTradeStore.loading && paginatedItems.length === 0">
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any trades here yet.'
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
                  label="Trade"
                  :hide-label="index > 0"
                  :title="item.uuid"
                  :subtitle="item.offer?.payment_method?.name"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Type"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full text-xs"
                >
                  <BaseTag
                    :color="item?.seller_id === user?.id ? 'danger' : 'success'"
                    flavor="pastel"
                  >
                    {{ item?.seller_id === user?.id ? 'Sell' : 'Buy' }}
                  </BaseTag>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full text-xs"
                  >{{ item.amount }}
                  {{ item?.offer?.currency }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-24 xs:w-full"
                >
                  <BaseTag :color="status(item?.status)" flavor="pastel">
                    {{ item?.status }}
                  </BaseTag>
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      :to="`/user/p2p/trades/${item.uuid}`"
                      title="View Details"
                    >
                      <template #start>
                        <Icon name="mdi-eye" class="me-2 block h-5 w-5" />
                      </template>
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
  </div>
</template>
