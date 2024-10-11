<script setup lang="ts">
import type { EcosystemToken } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Tokens'],
  title: 'Ecosystem Tokens',
})

const { getAdminTokens } = useEcosystem()
onMounted(async () => {
  await fetchTokens()
})

const router = useRouter()
const route = useRoute()
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const tokens = ref<EcosystemToken[]>([])
const totalItems = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// Function to fetch tokens with query parameters
async function fetchTokens() {
  loading.value = true
  const response = await getAdminTokens({
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  })
  if (response.status === 'success') {
    // Update this line to match the actual structure of your response
    tokens.value = response.data.result.data
    totalItems.value = response.data.result.pagination.totalItems
    totalPages.value = response.data.result.pagination.totalPages
  }
  loading.value = false
}

// Watch for changes in the query parameters and refetch the tokens
watch([filter, perPage, page], fetchTokens)

// Update the router's query parameters whenever filter, perPage, or page changes
watch([filter, perPage, page], () => {
  router.push({
    query: {
      ...route.query,
      filter: filter.value,
      perPage: perPage.value.toString(),
      page: page.value.toString(),
    },
  })
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
          placeholder="Filter transaction hash..."
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
          :to="`/admin/extensions/ecosystem/blockchains/wallets`"
          class="ms-2"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2" />
          {{ $t('Back') }}</BaseButton
        >
      </template>

      <div class="mt-6">
        <template v-if="!loading && tokens?.length === 0">
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
              v-for="(item, index) in tokens"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Token"
                  :hide-label="index > 0"
                  :title="`${item.currency} (${item.name})`"
                  :subtitle="item.contract"
                  :avatar="`${
                    item.icon ??
                    `/img/crypto/${item.currency.toLowerCase()}.png`
                  }`"
                />
              </template>
              <template #end>
                <TableFlexTableStart
                  label="Token"
                  :hide-label="index > 0"
                  :title="item.chain"
                  :subtitle="item.network"
                  class="w-full sm:w-40"
                />
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="item.status ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Details"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <TairoButtonIcon
                    :color="item.showDetails ? 'warning' : 'muted'"
                    flavor="pastel"
                    @click="item.showDetails = !item.showDetails"
                    condensed
                  >
                    <Icon
                      :name="
                        item.showDetails ? 'line-md:chevron-up' : 'mdi:eye'
                      "
                      class="h-5 w-5"
                    />
                  </TairoButtonIcon>
                </TableFlexTableCell>
              </template>

              <template #details v-if="item.showDetails">
                <div
                  class="px-2 pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                >
                  <p><strong>Type:</strong> {{ item.type }}</p>
                  <p v-if="item.method !== null && item.method !== ''">
                    <strong>Decimals:</strong> {{ item.decimals }}
                  </p>
                  <p>
                    <strong>Created at:</strong>
                    {{ formatDate(item.created_at) }}
                  </p>
                  <p v-if="item.precision">
                    <strong>Precisions:</strong> {{ item.precision }}
                  </p>
                  <div v-if="item.limits?.withdrawal?.min">
                    <strong>Withdrawal Limits:</strong>
                    <div class="pl-2 text-sm">
                      <div>Min: {{ item.limits?.withdrawal?.min }}</div>
                      <div v-if="item.limits?.withdrawal?.max">
                        Max: {{ item.limits?.withdrawal?.max }}
                      </div>
                    </div>
                  </div>
                  <div v-if="item.fees?.withdrawal">
                    <strong>Fees:</strong>
                    <div class="pl-2 text-sm">
                      <div>Withdrawal: {{ item.fees?.withdrawal }}</div>
                      <div v-if="item.fees?.min_withdrawal">
                        Min Withdrawal: {{ item.fees?.min_withdrawal }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </TableFlexTableRow>
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
