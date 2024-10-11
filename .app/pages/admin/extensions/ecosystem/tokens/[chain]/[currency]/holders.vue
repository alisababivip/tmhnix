<script setup lang="ts">
import type { EcosystemMasterWallet, EcosystemToken } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Token Holders'],
  title: 'Ecosystem Token Holders',
})

const { getMasterWalletByChain, getTokenHolders } = useEcosystem()
const route = useRoute()
const { chain, currency } = route.params
const wallet = ref<EcosystemMasterWallet>()
const token = ref<EcosystemToken>()
const tokenHolders = ref<any[]>([])

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

onMounted(async () => {
  const response = await getMasterWalletByChain(chain)
  if (response.status === 'success') {
    wallet.value = response.data.result
  }
  loading.value = true
  const responseToken = await getTokenHolders(chain, currency)
  if (responseToken.status === 'success') {
    tokenHolders.value = responseToken.data.result.holders
    token.value = responseToken.data.result.token
  }
  loading.value = false
})

const items = computed(() =>
  tokenHolders.value.filter((holder) => holder.address.includes(filter.value)),
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
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter by address..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
      </template>
      <template #right>
        <BaseButton color="muted" class="ms-2" @click.prevent="$router.back()">
          <Icon name="line-md:chevron-left" class="me-2" />
          Back
        </BaseButton>
      </template>

      <!-- Token Holders -->

      <div class="mt-6">
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
                  label="Address"
                  :hide-label="index > 0"
                  :title="item.address"
                  :subtitle="`${token?.network} (${token?.chain})`"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Balance"
                  :hide-label="index > 0"
                  class="w-60 xs:w-full"
                >
                  {{ item.balance }}
                  {{ token?.currency }}
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :current-page="page"
            :total-items="items.length"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
