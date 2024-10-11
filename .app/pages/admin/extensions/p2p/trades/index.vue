<script setup lang="ts">
import { useAdminP2PTradesStore } from '~~/store/extensions/p2p/admin/trades'
import type { P2PTrade } from '~~/types'

definePageMeta({
  permissions: ['View P2P Trades'],
  title: 'P2P Trades',
})

const p2pTradeStore = useAdminP2PTradesStore()
const route = useRoute()

const filters = ref(false)
const filter = ref('')
const sellerUuid = ref(null)
const buyerUuid = ref(null)
const sellerName = ref(null)
const buyerName = ref(null)
const fromDate = ref('')
const toDate = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pTradeStore.trades
    .filter((trade) => {
      // seller Filter
      if (sellerUuid.value && sellerUuid.value !== trade?.seller?.uuid)
        return false

      // buyer Filter
      if (buyerUuid.value && buyerUuid.value !== trade?.user?.uuid) return false

      // seller Name Filter
      const sellerNameString = `${trade?.seller?.first_name?.toLowerCase()} ${trade?.seller?.last_name?.toLowerCase()}`
      const buyerNameString = `${trade?.user?.first_name?.toLowerCase()} ${trade?.user?.last_name?.toLowerCase()}`
      if (sellerName.value && !sellerNameString.includes(sellerName.value))
        return false

      // buyer Name Filter
      if (buyerName.value && !buyerNameString.includes(buyerName.value))
        return false

      // Date Range Filter
      if (
        fromDate.value &&
        new Date(trade.created_at) < new Date(fromDate.value)
      )
        return false
      if (toDate.value && new Date(trade.created_at) > new Date(toDate.value))
        return false

      // Reference ID Filter
      return (
        !filter.value ||
        trade.uuid?.includes(filter.value) ||
        trade?.offer?.currency?.includes(filter.value)
      )
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

onMounted(async () => {
  if (p2pTradeStore.trades.length === 0) {
    p2pTradeStore.loading = true
    await p2pTradeStore.fetchP2PTrades()
    p2pTradeStore.loading = false
  }
})

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
        <BaseButton @click="filters = !filters" color="muted" block>
          <Icon v-if="filters" name="line-md:arrow-up" class="h-4 w-4 mr-2" />
          <Icon v-else name="line-md:arrow-down" class="h-4 w-4 mr-2" />
          {{ $t('Filters') }}
        </BaseButton>
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
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <BaseCard
            :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 p-5`"
            v-if="filters"
          >
            <!-- Seller UUID Input -->
            <BaseInput
              v-model="sellerUuid"
              label="Seller UUID"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
              placeholder="Filter by Seller UUID..."
            />

            <BaseInput
              v-model="sellerName"
              label="Seller Name"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
              placeholder="Filter by Seller Name..."
            />

            <!-- Buyer UUID Input -->
            <BaseInput
              v-model="buyerUuid"
              label="Buyer UUID"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
              placeholder="Filter by Buyer UUID..."
            />

            <BaseInput
              v-model="buyerName"
              label="Buyer Name"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
              placeholder="Filter by Buyer Name..."
            />

            <!-- Date Range Inputs -->
            <BaseInput v-model="fromDate" type="date" label="From" />
            <BaseInput v-model="toDate" type="date" label="To" />
          </BaseCard>
        </TransitionGroup>
        <template v-if="!p2pTradeStore.loading && paginatedItems.length === 0">
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
                  label="Trade"
                  :hide-label="index > 0"
                  :title="item.uuid"
                  :subtitle="item.offer?.payment_method?.name"
                />
              </template>
              <template #end>
                <TableFlexTableStart
                  label="Peers"
                  :hide-label="index > 0"
                  :title="`Seller: ${item.seller?.first_name} ${item.seller?.last_name}`"
                  :subtitle="`Buyer: ${item.user?.first_name} ${item.user?.last_name}`"
                />
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-24 xs:w-full text-xs"
                  >{{ item.amount }}
                  {{ item?.offer?.currency }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full"
                >
                  <BaseTag :color="status(item?.status)" flavor="pastel">
                    {{ item?.status }}
                  </BaseTag>
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
