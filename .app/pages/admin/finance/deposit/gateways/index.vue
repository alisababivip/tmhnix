<script setup lang="ts">
import { useDepositGatewayStore } from '~~/store/admin/deposit/gateways'
import type { DepositGateway } from '~~/types'
definePageMeta({
  permissions: ['Access Deposit Gateways'],
  title: 'Deposit Gateways',
})

const depositGatewayStore = useDepositGatewayStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(
  () => selected.value.length === depositGatewayStore.gateways.length,
)

const items = computed(() =>
  depositGatewayStore.gateways.filter((item) =>
    item.title.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = items.value.map((item) => item.id) ?? []
  }
}

onMounted(async () => {
  if (depositGatewayStore.gateways.length === 0) {
    depositGatewayStore.loading = true
    await depositGatewayStore.fetchDepositGateways()
    depositGatewayStore.loading = false
  }
})
const { toast } = useUtils()

function updateSelectedDepositGatewaystatus(status: boolean) {
  depositGatewayStore
    .updateDepositGatewaysStatus(selected.value, status)
    .then((response) => {
      if (response.status === 'success') {
        toast.success(response as any)
      } else {
        toast.danger(response as any)
      }
      selected.value = []
    })
}

const router = useRouter()

function selectGateway(gateway: DepositGateway) {
  depositGatewayStore.selectGateway(gateway)
  router.push(`/admin/finance/deposit/gateways/edit/${gateway.id}`)
}
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
          placeholder="Filter gateways..."
        />
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
        <template
          v-if="!depositGatewayStore.loading && paginatedItems?.length === 0"
        >
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
          <div
            class="bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full mb-2"
            v-if="!depositGatewayStore.loading && selected.length > 0"
          >
            <span class="text-sm">
              {{ $t('You have selected') }} {{ selected.length }}
              {{ $t('items of the total') }} {{ items.length }}
              {{ $t('items') }}.
            </span>
            <div class="flex gap-2">
              <TairoButtonIcon
                color="danger"
                size="xs"
                data-nui-tooltip="Disable currencies"
                @click="() => updateSelectedDepositGatewaystatus(false)"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="success"
                size="xs"
                data-nui-tooltip="Enable currencies"
                @click="() => updateSelectedDepositGatewaystatus(true)"
              >
                <Icon name="line-md:confirm" class="h-5 w-5" />
              </TairoButtonIcon>
            </div>
          </div>
          <TairoFlexTable>
            <template #header>
              <div class="relative">
                <span class="pl-4">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    @click="toggleAllVisibleSelection"
                  />
                </span>
              </div>
            </template>

            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableCell
                  data-content="Selection"
                  class="xs:absolute right-2 ml-2"
                >
                  <BaseCheckbox
                    v-model="selected"
                    :value="item.id"
                    :name="`item-checkbox-${item.id}`"
                    shape="rounded"
                    class="text-primary-500"
                  />
                </TableFlexTableCell>
                <TableFlexTableStart
                  label="Gateway"
                  :hide-label="index > 0"
                  :logo="item.image"
                  :title="item.title"
                  :subtitle="item.description"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Currencies"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ Object.keys(item.currencies).length }}</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="% Fee"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.percentage_fee ?? 0 }}%</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Fixed Fee"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.fixed_fee ?? 0 }}%</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Min / Max"
                  :hide-label="index > 0"
                  class="w-40 xs:w-full"
                  >{{ item.min_amount }} /
                  {{ item.max_amount ?? '∞' }}</TableFlexTableCell
                >
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
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <TairoButtonIcon
                    condensed
                    color="warning"
                    @click="selectGateway(item)"
                    data-nui-tooltip="Edit"
                  >
                    <Icon name="line-md:edit" class="h-4 w-4" />
                  </TairoButtonIcon>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :item-per-page="perPage"
            :current-page="page"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
