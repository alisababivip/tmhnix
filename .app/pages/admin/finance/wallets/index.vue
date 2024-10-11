<script setup lang="ts">
import { hi } from 'date-fns/locale'

definePageMeta({
  permissions: ['Access Wallet Management'],
  title: 'Wallets Management',
})

const { adminGetWallets } = useWallet()

const userParam = computed(() => route.query.user as string | undefined)
const typeParam = computed(() => route.query.type as string | undefined)

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const filters = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const selectedType = ref((route.query.type as string | undefined) ?? undefined)
const types = ['All', 'FIAT', 'SPOT']
const totalItems = ref(0)
const totalPages = ref(0)
const wallets = ref([])
const queryType = computed(() =>
  selectedType.value !== 'All' ? selectedType.value : undefined,
)
const hideSmallBalances = ref(false)
const userId = ref('')

// Fetch wallets with query parameters
async function fetchWallets() {
  loading.value = true
  const response = await adminGetWallets({
    user: userParam.value || userId.value,
    type: queryType.value,
    filter:
      filter.value !== '' && filter.value !== undefined
        ? filter.value
        : undefined,
    perPage: perPage.value,
    page: page.value,
    hideSmallBalances: hideSmallBalances.value,
  })
  if (response.status === 'success') {
    wallets.value = response.data.result.data
    totalItems.value = response.data.result.pagination.totalItems
    totalPages.value = response.data.result.pagination.totalPages
  }
  loading.value = false
}

// Watch for changes in the query parameters and refetch the wallets
watch(
  [filter, perPage, page, selectedType, hideSmallBalances, userId],
  fetchWallets,
)

// Update the router's query parameters whenever filter, perPage, or page changes
watch(
  [filter, perPage, selectedType, hideSmallBalances, userId],
  async (newValues, oldValues) => {
    const [
      newFilter,
      newPerPage,
      newSelectedType,
      newHideSmallBalances,
      newUserId,
    ] = newValues
    const [oldFilter, , , ,] = oldValues

    // If the filter has changed and it's not the initial load, reset the page to 1
    if (newFilter !== oldFilter && oldFilter !== undefined) {
      await router.push({
        query: {
          ...route.query,
          filter:
            newFilter !== '' && newFilter !== undefined ? newFilter : undefined,
          perPage: newPerPage.toString(),
          page: '1',
          hideSmallBalances: newHideSmallBalances.toString(),
          type: queryType.value,
        },
      })
    } else {
      await router.push({
        query: {
          ...route.query,
          filter:
            newFilter !== '' && newFilter !== undefined ? newFilter : undefined,
          perPage: newPerPage.toString(),
          page: page.value.toString(),
          hideSmallBalances: newHideSmallBalances.toString(),
          type: queryType.value,
        },
      })
    }
  },
)

onMounted(async () => {
  await fetchWallets()
})

const numberOfFiltersToShow = computed(() => {
  let filtersCount = 3 // Starting with 3 as we have three main filters
  if (selectedType.value) filtersCount--
  return filtersCount
})

const view = (walletUuid: string) => {
  router.push(`/admin/finance/wallets/${walletUuid}`)
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
            placeholder="Filter Wallet Currency/UUID..."
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
            :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${numberOfFiltersToShow} lg:grid-cols-${numberOfFiltersToShow} mb-6 p-5 items-end`"
            v-if="filters"
          >
            <!-- Wallet Type Dropdown -->
            <BaseListbox
              v-model="selectedType"
              label="Wallet Type"
              :items="types"
              placeholder="Select a Wallet Type"
            />

            <BaseInput
              v-model="userId"
              label="User UUID"
              placeholder="Enter User UUID"
              :classes="{
                wrapper: 'w-full sm:w-auto',
              }"
            />

            <div>
              <BaseCheckbox
                v-model="hideSmallBalances"
                value="no-balance"
                label="Hide Small Balances"
                shape="rounded"
                color="primary"
              />
            </div>
          </BaseCard>
        </TransitionGroup>
        <template v-if="!loading && wallets?.length === 0">
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
                v-for="(item, index) in wallets"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="Wallet"
                    :hide-label="index > 0"
                    :logo="`/img/crypto/${item.currency.toLowerCase()}.png`"
                    :title="item.currency"
                    :subtitle="item.uuid"
                  />
                  <TableFlexTableStart
                    label="User"
                    :hide-label="index > 0"
                    :logo="item.user?.avatar"
                    :title="`${item.user?.first_name} (${item.user?.last_name})`"
                    :subtitle="item.user?.uuid"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Balance"
                    :hide-label="index > 0"
                    class="xs:w-full sm:w-40 text-xs"
                    >{{
                      item.type === 'FIAT'
                        ? formatPrice(item.balance, item.currency)
                        : item.balance + ' ' + item.currency
                    }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="xs:w-full sm:w-20"
                  >
                    <TairoButtonIcon
                      condensed
                      color="muted"
                      @click="view(item.uuid)"
                      data-nui-tooltip="View"
                    >
                      <Icon name="ph:eye-duotone" class="h-4 w-4" />
                    </TairoButtonIcon>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="totalPages > 1"
            :current-page="page"
            :total-items="totalItems"
            :itemPerPage="perPage"
            :total-pages="totalPages"
            @page-changed="
              (newPage) =>
                router.push({
                  query: { ...route.query, page: newPage.toString() },
                })
            "
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
