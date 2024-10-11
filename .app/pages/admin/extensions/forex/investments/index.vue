<script setup lang="ts">
import { useForexInvestmentStore } from '~~/store/extensions/forex/admin/investment'
import { useForexPlanStore } from '~~/store/extensions/forex/admin/plans'
definePageMeta({
  permissions: ['View Forex Investments'],
  title: 'Forex Investments',
})

const route = useRoute()
const forexInvestmentStore = useForexInvestmentStore()
const forexPlanStore = useForexPlanStore()

const oldFilter = ref('')
const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

onMounted(async () => {
  loading.value = true

  await forexInvestmentStore.fetchInvestments()

  if (forexPlanStore.plans.length === 0) {
    await forexPlanStore.fetchForexPlans()
  }

  loading.value = false
})

const items = computed(() =>
  forexInvestmentStore.investments
    .filter((investment) => {
      // Transaction Type Filter
      if (
        selectedPlan.value &&
        selectedPlan.value !== 'All' &&
        investment.type !== selectedPlan.value
      )
        return false

      // Status Filter
      if (
        selectedStatus.value &&
        selectedStatus.value !== 'All' &&
        investment.status !== selectedStatus.value
      )
        return false

      // Result Filter
      if (
        selectedResult.value &&
        selectedResult.value !== 'All' &&
        investment.result !== selectedResult.value
      )
        return false

      // Date Range Filter
      if (
        fromDate.value &&
        new Date(investment.created_at) < new Date(fromDate.value)
      )
        return false
      if (
        toDate.value &&
        new Date(investment.created_at) > new Date(toDate.value)
      )
        return false

      // Reference ID Filter
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
      return !filter.value || investment.uuid?.includes(filter.value)
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

const filters = ref(false)
// Filter variables
const selectedPlan = ref('')
const selectedStatus = ref('')
const selectedResult = ref('')
const fromDate = ref('')
const toDate = ref('')

const transactionStatuses = [
  'All',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
]

const transactionResults = ['All', 'WIN', 'LOSS', 'DRAW']

const router = useRouter()
const view = (uuid: string) => {
  router.push(`/admin/extensions/forex/investments/${uuid}`)
}

const { formatedDate } = useUtils()

const status = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'ACTIVE':
      return 'info'
    default:
      return 'info'
  }
}

const resultStatus = (status: string) => {
  switch (status) {
    case 'WIN':
      return 'success'
    case 'LOSS':
      return 'danger'
    case 'DRAW':
      return 'warning'
    default:
      return 'info'
  }
}

const resultSign = (status: string) => {
  switch (status) {
    case 'WIN':
      return '+'
    case 'LOSS':
      return '-'
    case 'DRAW':
      return ''
    default:
      return ''
  }
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
            placeholder="Search Investment ID..."
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
            :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 p-5`"
            v-if="filters"
          >
            <!-- Plans Dropdown -->
            <BaseListbox
              v-model="selectedPlan"
              label="Investment Plan"
              :items="forexPlanStore.plans.map((plan) => plan.title)"
              placeholder="Select Investment Plan"
            />

            <!-- Status Dropdown -->
            <BaseListbox
              v-model="selectedStatus"
              label="Status"
              :items="transactionStatuses"
              placeholder="Select a Status"
            />

            <!-- Result Dropdown -->
            <BaseListbox
              v-model="selectedResult"
              label="Result"
              :items="transactionResults"
              placeholder="Select a Result"
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
                    :title="`${item.user?.first_name} (${item.user?.last_name})`"
                    :subtitle="formatedDate(item.created_at, true)"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Plan"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
                    >{{ item.plan?.title }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Amount"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full text-xs"
                    >{{ item.amount }}</TableFlexTableCell
                  >
                  <TableFlexTableCell
                    label="Result"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      :color="resultStatus(item.result)"
                      flavor="pastel"
                      condensed
                      ><span v-if="item.result"
                        >{{ resultSign(item.result)
                        }}{{ item.result === 'DRAW' ? 0 : item.profit }}</span
                      >
                      <span v-else>N/A</span></BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      :color="status(item.status)"
                      flavor="pastel"
                      condensed
                      >{{ item.status }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-20"
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
