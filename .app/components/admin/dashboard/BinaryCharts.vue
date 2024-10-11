<script setup lang="ts">
const { getBinaryOrders } = useExchange()
const { useSparklineConfiguration } = useUtils()

const route = useRoute()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.items)

const { sciToPrecision } = useUtils()
const hideSmallBalances = ref(false)

// Pagination Constants
const filter = ref('')
const perPage = ref(5)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const items = computed(() => {
  if (currencies.value && Array.isArray(currencies.value)) {
    return currencies.value
      .map((item) => {
        // Filter binaryOrders based on pair
        const relevantOrders = binaryOrders.value.filter((order) => {
          const pair = order.symbol.split('/')[1] // Splitting the symbol to get the pair
          return pair === item.currency
        })

        let winning = 0
        let losses = 0

        relevantOrders.forEach((order) => {
          if (order.status === 'WIN') {
            winning += order.amount * (order.profit / 100)
          } else if (order.status === 'LOSS') {
            losses += order.amount // as its profit is always 100 if it's a loss
          }
        })

        return {
          ...item,
          winning,
          losses,
        }
      })
      .filter((item) => {
        if (hideSmallBalances.value) {
          return item.winning !== 0 || item.losses !== 0
        }
        return item.currency.toLowerCase().includes(filter.value.toLowerCase())
      })
  } else {
    return []
  }
})

const useTotalBinaryOrders = (items: any) =>
  useSparklineConfiguration(items, 'binary', 'Binary Positions', 'primary')

const useWonBinaryOrders = (items: any) =>
  useSparklineConfiguration(
    items.filter((u: any) => u.status === 'WIN'),
    'binary',
    'Won Positions',
    'success',
  )

const useLostBinaryOrders = (items: any) =>
  useSparklineConfiguration(
    items.filter((u: any) => u.status === 'LOSS'),
    'binary',
    'Lost Positions',
    'danger',
  )

const useDrawBinaryOrders = (items: any) =>
  useSparklineConfiguration(
    items.filter((u: any) => u.status === 'DRAW'),
    'binary',
    'Draw Positions',
    'warning',
  )

const totalBinaryOrdersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Total Positions',
      data: [],
    },
  ],
})

const wonBinaryOrdersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Won Positions',
      data: [],
    },
  ],
})

const lostBinaryOrdersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Lost Positions',
      data: [],
    },
  ],
})

const drawBinaryOrdersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Draw Positions',
      data: [],
    },
  ],
})

const binaryOrders = ref([])

let chartKey = ref(0)

// Force a re-render of the chart
const reinitializeChart = () => {
  chartKey.value++
}
onMounted(async () => {
  const response = await getBinaryOrders()
  if (response.status === 'success') {
    binaryOrders.value = response.data.result
    reinitializeChart()

    totalBinaryOrdersSparkline.value = useTotalBinaryOrders(binaryOrders.value)
    wonBinaryOrdersSparkline.value = useWonBinaryOrders(binaryOrders.value)
    lostBinaryOrdersSparkline.value = useLostBinaryOrders(binaryOrders.value)
    drawBinaryOrdersSparkline.value = useDrawBinaryOrders(binaryOrders.value)
  }
  if (currencyStore.items.length === 0) {
    await currencyStore.fetchCurrencies()
  }
})

const normalizeZero = (num) => (Object.is(num, -0) ? 0 : num)
</script>

<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="totalBinaryOrdersSparkline"
            :key="chartKey"
            icon="ic:sharp-clear-all"
            icon-color="primary"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="wonBinaryOrdersSparkline"
            :key="chartKey"
            icon="material-symbols:check"
            icon-color="success"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="lostBinaryOrdersSparkline"
            :key="chartKey"
            icon="ph:x"
            icon-color="danger"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="drawBinaryOrdersSparkline"
            :key="chartKey"
            icon="tabler:slash"
            icon-color="warning"
          />
        </BaseCard>
      </div>
    </div>

    <TairoContentWrapper v-if="currencies.length > 0" class="mt-6">
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Search Coin"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseCheckbox
          v-model="hideSmallBalances"
          value="no-balance"
          label="Hide No Profit Positions"
          shape="rounded"
          color="primary"
        />
      </template>
      <div>
        <div v-if="!paginatedItems || paginatedItems.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                loading="lazy"
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                loading="lazy"
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else class="space-y-2 xs:pt-0 sm:pt-5">
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
              :key="index"
              shape="rounded"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Wallet"
                  :hide-label="index > 0"
                  :title="item.currency"
                  :subtitle="item.name"
                  :logo="`/img/crypto/${item.currency.toLowerCase()}.png`"
                  :initials="item.currency"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Total Winning"
                  :hide-label="index > 0"
                  class="w-full sm:w-40"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.winning) > 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{ sciToPrecision(item.winning || 0, item.precision) }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Total Losses"
                  :hide-label="index > 0"
                  class="w-full sm:w-40"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.losses) > 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{ sciToPrecision(item.losses || 0, item.precision) }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Admin Profit"
                  :hide-label="index > 0"
                  class="w-full sm:w-40"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.winning) - Number(item.losses) !== 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{ Number(item.winning) - Number(item.losses) || 0 }}
                  </span>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TransitionGroup>
        </div>
        <div class="mt-4" v-if="paginatedItems.length > perPage">
          <BasePagination
            :total-items="paginatedItems.length ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
