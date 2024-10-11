<script setup lang="ts">
import type { EcosystemCustodialWallet } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Custodial Wallets'],
  title: 'Ecosystem Custodial Wallets',
})

const { getCustodialWallet } = useEcosystem()
const route = useRoute()
const { chain, uuid } = route.params

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)
const wallet = ref<EcosystemCustodialWallet[]>([])

const items = computed(
  () =>
    wallet.value?.balances?.filter((item) => item.chain.includes(filter.value)),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value?.slice(start, end)
})

onMounted(async () => {
  await fetchCustodialWallet()
})

const fetchCustodialWallet = async () => {
  loading.value = true
  const response = await getCustodialWallet(uuid)
  if (response.status === 'success') {
    wallet.value = response.data.result
  }
  loading.value = false
}

const { toast } = useUtils()
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
        {{ $t('Native Balance') }}
      </BaseHeading>
      <BaseHeading
        as="h2"
        size="xl"
        weight="medium"
        class="text-muted-800 dark:text-white"
      >
        {{ wallet?.nativeBalance ?? 0 }} {{ wallet?.nativeCurrency }}
      </BaseHeading>
    </div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter chain..."
        />
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
      <template #right>
        <BaseButton
          color="muted"
          :to="`/admin/extensions/ecosystem/blockchains/custodial/${chain}`"
          class="ms-2"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2" />
          {{ $t('Back') }}</BaseButton
        >
      </template>
      <div>
        <template v-if="!loading && paginatedItems?.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
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
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Token"
                  :hide-label="index > 0"
                  :title="`${item.currency} (${item.name})`"
                  :subtitle="item.contract"
                  :avatar="
                    item.icon ??
                    `/img/crypto/${item.currency.toLowerCase()}.png`
                  "
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Balance"
                  :hide-label="index > 0"
                  class="text-sm"
                  :loading="loading"
                >
                  {{ Number(item.balance).toFixed(item.decimals) }}
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items?.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
