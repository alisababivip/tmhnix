<script setup lang="ts">
const props = defineProps({
  flutter: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.items)
const walletStore = useWalletStore()
const wallets = computed(() => walletStore.getSpotWallets)

onMounted(async () => {
  if (currencyStore.items.length === 0) {
    await currencyStore.fetchCurrencies()
  }

  await walletStore.fetchWalletsByType('SPOT')
})

const { sciToPrecision } = useUtils()
const hideSmallBalances = ref(false)

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

// Modify the items computed value to include the new filter
const items = computed(() => {
  if (currencies.value && Array.isArray(currencies.value)) {
    return currencies.value
      .map((currency) => {
        const wallet = wallets.value.find(
          (walletItem: any) =>
            walletItem.currency.toLowerCase() ===
            currency.currency.toLowerCase(),
        )
        return {
          ...currency,
          wallet: wallet || null,
        }
      })
      .filter((item) => {
        if (hideSmallBalances.value) {
          const total = item.wallet?.balance + item.wallet?.inOrder || 0
          return (
            total > 0 &&
            item.currency.toLowerCase().includes(filter.value.toLowerCase())
          )
        }
        return item.currency.toLowerCase().includes(filter.value.toLowerCase())
      })
  } else {
    return []
  }
})

// New computed property to calculate total balance in USDT
const totalBalanceInUSDT = computed(() => {
  if (currencies.value && Array.isArray(currencies.value)) {
    return currencies.value.reduce((total, item) => {
      const wallet = wallets.value.find(
        (walletItem: any) => walletItem.currency === item.currency,
      )

      if (wallet) {
        if (wallet.currency === 'USDT') {
          total += wallet.balance + wallet.inOrder
        } else {
          total += (wallet.balance + wallet.inOrder) * (item.price || 0)
        }
      }
      return total
    }, 0)
  }
  return 0
})
</script>

<template>
  <div>
    <div
      class="mb-5 flex xs:flex-col justify-between items-center gap-3 pb-5 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md"
    >
      <BaseHeading
        as="h2"
        size="xl"
        weight="medium"
        class="text-muted-800 dark:text-white"
      >
        {{ $t('Estimated Balance') }}
      </BaseHeading>
      <BaseHeading
        as="h2"
        size="xl"
        weight="medium"
        class="text-muted-800 dark:text-white"
      >
        <span class="text-gray-800 dark:text-gray-400">≈</span>
        {{ totalBalanceInUSDT.toFixed(2) }} USDT
      </BaseHeading>
    </div>
    <TairoContentWrapper>
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
          label="Hide Small Balances"
          shape="rounded"
          color="primary"
        />
      </template>
      <div class="pb-10">
        <div v-if="!paginatedItems || paginatedItems.length === 0">
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
                  label="Total"
                  :hide-label="index > 0"
                  class="w-full sm:w-40"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.wallet?.balance) +
                        Number(item.wallet?.inOrder) >
                      0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{
                      sciToPrecision(
                        item.wallet?.balance + item.wallet?.inOrder || 0,
                        item.precision,
                      )
                    }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Available"
                  :hide-label="index > 0"
                  class="w-full sm:w-40 xs:flex sm:hidden lg:flex"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.wallet?.balance) > 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{
                      sciToPrecision(item.wallet?.balance || 0, item.precision)
                    }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="In Order"
                  :hide-label="index > 0"
                  class="w-full sm:w-40 xs:flex sm:hidden lg:flex"
                >
                  <span
                    class="font-sans text-sm"
                    :class="
                      Number(item.wallet?.inOrder) > 0
                        ? ''
                        : 'text-muted-500 dark:text-muted-400'
                    "
                  >
                    {{
                      sciToPrecision(item.wallet?.inOrder || 0, item.precision)
                    }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell label="action" :hide-label="index > 0">
                  <NuxtLink
                    :to="`/user/${
                      flutter ? 'flutter/' : ''
                    }wallets/spot/${item.currency.toLowerCase()}`"
                  >
                    <BaseButtonAction
                      class="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>{{ $t('View') }}</span>
                    </BaseButtonAction>
                  </NuxtLink>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TransitionGroup>
        </div>
        <div class="mt-4">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            shape="curved"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
