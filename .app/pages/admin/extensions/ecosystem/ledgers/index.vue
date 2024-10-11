<script setup lang="ts">
definePageMeta({
  permissions: ['View Ecosystem Private Ledgers'],
  title: 'Ecosystem Private Ledgers Management',
})

const route = useRoute()
const { getLedgers } = useEcosystem()

const router = useRouter()
const oldFilter = ref('')
const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const wallets = ref([])

onMounted(async () => {
  loading.value = true

  try {
    const response = await getLedgers()

    wallets.value = response.data.result
    loading.value = false
  } catch (error) {
    wallets.value = []
  }
  loading.value = false
})

const items = computed(() =>
  wallets.value.filter((wallet) => {
    // Wallet Address Filter
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
    return !filter.value || wallet.currency?.includes(filter.value)
  }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})
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
            placeholder="Filter Wallet Currency..."
          />
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
                    label="Wallet"
                    :hide-label="index > 0"
                    :title="`${item.currency} (${item.chain})`"
                    :subtitle="item.wallet?.uuid"
                  />
                  <TableFlexTableStart
                    label="User"
                    :hide-label="index > 0"
                    :logo="item.wallet?.user?.avatar"
                    :title="`${item.wallet?.user?.first_name} (${item.wallet?.user?.last_name})`"
                    :subtitle="item.wallet?.user?.uuid"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Offchain Difference"
                    :hide-label="index > 0"
                    class="xs:w-full sm:w-40 text-xs"
                    >{{ item.offchain_difference }}</TableFlexTableCell
                  >
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
