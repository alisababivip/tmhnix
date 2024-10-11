<script setup lang="ts">
definePageMeta({
  permissions: ['Access Exchange Logs'],
  title: 'Exchange Logs',
})

const route = useRoute()
const { getOrdersByParams } = useExchange()
const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.items)

const userParam = computed(() => route.query.user as string | undefined)
const typeParam = computed(() => {
  return typeof route.query.type === 'string' ? route.query.type : 'binary'
})
const statusParam = computed(() => route.query.status as string | undefined)
const currencyParam = computed(() => route.query.currency as string | undefined)
const sideParam = computed(() => route.query.side as string | undefined)

const router = useRouter()
const oldFilter = ref('')
const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

let logs = ref([])

onMounted(async () => {
  loading.value = true

  try {
    const response = await getOrdersByParams(
      userParam.value,
      typeParam.value,
      statusParam.value,
      currencyParam.value,
      sideParam.value,
    )

    logs.value = response.data.result
  } catch (error) {
    logs.value = []
    console.log(error.message)
  }

  if (currencyStore.items.length === 0) {
    await currencyStore.fetchCurrencies()
  }

  loading.value = false
})

watch(
  () => route.query,
  async () => {
    loading.value = true

    try {
      const response = await getOrdersByParams(
        userParam.value,
        typeParam.value,
        statusParam.value,
        currencyParam.value,
        sideParam.value,
      )

      logs.value = response.data.result
    } catch (error) {
      logs.value = []
      console.log(error.message)
    }

    loading.value = false
  },
  { immediate: true },
)

const items = computed(() =>
  logs.value
    .filter((log) => {
      // User Filter
      if (userParam.value && log.user.uuid !== userParam.value) return false

      // Side Filter
      if (
        selectedSide.value &&
        selectedSide.value !== 'All' &&
        log.side !== selectedSide.value
      )
        return false

      // Currency Param
      if (
        currencyParam.value &&
        getCurrency(log.symbol) !== currencyParam.value
      )
        return false

      // Currency Filter
      if (
        selectedCurrency.value &&
        selectedCurrency.value !== 'All' &&
        getCurrency(log.symbol) !== selectedCurrency.value
      )
        return false

      // Status Filter
      if (
        selectedStatus.value &&
        selectedStatus.value !== 'All' &&
        log.status !== selectedStatus.value
      )
        return false

      // Date Range Filter
      if (fromDate.value && new Date(log.created_at) < new Date(fromDate.value))
        return false
      if (toDate.value && new Date(log.created_at) > new Date(toDate.value))
        return false

      // UUID Filter
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
      return !filter.value || log.uuid?.includes(filter.value)
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

const getCurrency = (symbol: string) => {
  return symbol.split('/')[0]
}

const getPair = (symbol: string) => {
  return symbol.split('/')[1]
}

const binaryProfit = (item: any) => {
  const pair = getPair(item.symbol)
  let profit, sign
  switch (item.status) {
    case 'WIN':
      sign = '+'
      profit = item.amount + item.amount * (item.profit / 100)
      break
    case 'LOSS':
      sign = '-'
      profit = item.amount
      break
    case 'DRAW':
      sign = ''
      profit = 0
      break

    default:
      break
  }

  return sign + profit + ' ' + pair
}

const status = (status: string) => {
  switch (typeParam.value) {
    case 'trade':
      switch (status) {
        case 'COMPLETED':
          return 'success'
        case 'PENDING':
          return 'warning'
        case 'FAILED':
          return 'danger'
        case 'CANCELLED':
          return 'danger'
        case 'REJECTED':
          return 'danger'
        case 'EXPIRED':
          return 'danger'
        default:
          return 'info'
      }
    case 'binary':
      switch (status) {
        case 'WIN':
          return 'success'
        case 'PENDING':
          return 'warning'
        case 'LOSS':
          return 'danger'
        case 'DRAW':
          return 'info'
        default:
          return 'info'
      }
  }
}

const filters = ref(false)
// Filter variables
const selectedSide = ref('')
const selectedStatus = ref('')
const selectedCurrency = ref('')
const fromDate = ref('')
const toDate = ref('')

// Predefined options
const sides =
  typeParam.value === 'binary'
    ? ['All', 'RISE', 'FALL']
    : ['All', 'BUY', 'SELL']
const orderStatuses =
  typeParam.value === 'binary'
    ? ['All', 'WIN', 'LOSS', 'DRAW', 'PENDING']
    : [
        'All',
        'COMPLETED',
        'PENDING',
        'FAILED',
        'CANCELLED',
        'REJECTED',
        'EXPIRED',
      ]

const numberOfFiltersToShow = computed(() => {
  let filtersCount = 3
  if (sideParam.value) filtersCount--
  if (statusParam.value) filtersCount--
  if (currencyParam.value) filtersCount--
  return filtersCount
})

const { formatedDate } = useUtils()

const precision = (currency: string) => {
  return (
    Number(
      currencies.value.find((item) => item.currency === currency)?.precision,
    ) || 8
  )
}
</script>

<template>
  <div>
    <BaseHeading
      as="h3"
      size="xl"
      weight="medium"
      class="text-muted-800 dark:text-white mb-4"
    >
      {{ typeParam.toUpperCase() }} {{ $t('Orders') }}
    </BaseHeading>
    <TairoContentWrapper>
      <template #left>
        <div class="w-full flex gap-2 xs:flex-col sm:flex-row items-center">
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            placeholder="Search Order ID..."
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
            <!-- Order Side Dropdown -->
            <BaseListbox
              v-if="!sideParam"
              v-model="selectedSide"
              label="Order Side"
              :items="sides"
              placeholder="Select order side"
            />

            <!-- Status Dropdown -->
            <BaseListbox
              v-if="!statusParam"
              v-model="selectedStatus"
              label="Status"
              :items="orderStatuses"
              placeholder="Select status"
            />

            <!-- Status Dropdown -->
            <BaseListbox
              v-if="!currencyParam"
              v-model="selectedCurrency"
              label="Currency"
              :items="currencies.map((c) => c.currency)"
              placeholder="Select currency"
            />

            <!-- Date Range Inputs -->
            <BaseInput v-model="fromDate" type="date" label="From" />
            <BaseInput v-model="toDate" type="date" label="To" />
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
                    label="User"
                    :hide-label="index > 0"
                    :logo="item.user?.avatar"
                    :title="`${item.user?.first_name} ${item.user?.last_name}`"
                    :subtitle="item.user?.uuid"
                  />
                  <TableFlexTableStart
                    label="Market"
                    :hide-label="index > 0"
                    :logo="`/img/crypto/${getCurrency(
                      item.symbol.toLowerCase(),
                    )}.png`"
                    :title="`${item.symbol}`"
                    :subtitle="formatedDate(item.created_at, true)"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Side"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
                    >{{ item.side }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Amount"
                    :hide-label="index > 0"
                    class="sm:w-20 md:w-30 lg:w-24 xs:w-full flex flex-row sm:flex-col text-xs"
                    ><div class="mr-1">
                      {{
                        parseFloat(item.amount).toFixed(
                          precision(
                            typeParam.value === 'trade'
                              ? getCurrency(item.symbol)
                              : getPair(item.symbol),
                          ),
                        )
                      }}
                    </div>
                    <div>
                      {{
                        typeParam.value === 'trade'
                          ? getCurrency(item.symbol)
                          : getPair(item.symbol)
                      }}
                    </div>
                  </TableFlexTableCell>
                  <template v-if="typeParam === 'trade' && !loading">
                    <TableFlexTableCell
                      label="Fee"
                      :hide-label="index > 0"
                      class="sm:w-20 md:w-30 lg:w-24 xs:w-full flex flex-row sm:flex-col text-xs"
                      ><div class="mx-1">
                        {{
                          parseFloat(item.fee).toFixed(
                            precision(item.fee_currency),
                          )
                        }}
                      </div>
                      <div>{{ item.fee_currency }}</div></TableFlexTableCell
                    >
                  </template>
                  <template v-if="typeParam === 'binary' && !loading">
                    <TableFlexTableCell
                      label="Profit"
                      :hide-label="index > 0"
                      class="sm:w-20 md:w-30 lg:w-24 xs:w-full text-xs"
                      :class="{
                        'text-green-500': item.status === 'WIN',
                        'text-red-500': item.status === 'LOSS',
                      }"
                      >{{ binaryProfit(item) }}</TableFlexTableCell
                    >
                  </template>
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="xs:w-full"
                    :class="{
                      'w-24': typeParam === 'trade',
                      'w-20': typeParam === 'binary',
                    }"
                  >
                    <BaseTag
                      :color="status(item.status)"
                      flavor="pastel"
                      condensed
                      >{{ item.status }}</BaseTag
                    >
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
  </div>
</template>
