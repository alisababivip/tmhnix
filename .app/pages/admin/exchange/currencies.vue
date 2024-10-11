<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  permissions: ['Access Exchange Currencies'],
  title: 'Exchange Currencies',
})

const currencyStore = useCurrencyStore()
const { updateCurrencyChains } = useExchange()
const currencies = computed(() => currencyStore.items)
const route = useRoute()
const { toast } = useUtils()

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modify the items computed value to include the new filter
const items = computed(() => {
  if (currencies.value && Array.isArray(currencies.value)) {
    return currencies.value.filter((item) => {
      return item.currency.toLowerCase().includes(filter.value.toLowerCase())
    })
  } else {
    return []
  }
})

// Pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

// Selection
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === items.value.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = items.value.map((item) => item.id) ?? []
  }
}

// Edit
const isEditOpen = ref(false)
const selectedCurrencyChains = ref([])
const isSubmitting = ref(false)

const update = async (values: any) => {
  isSubmitting.value = true
  try {
    const response = await updateCurrencyChains(
      currencyStore.selectedCurrency?.id as number,
      selectedCurrencyChains.value,
    )
    toast.response(response as any)
  } catch (error) {
    toast.danger(error as any)
  }
  isEditOpen.value = false
  currencyStore.selectCurrency(null)
  isSubmitting.value = false
}

const openEditModal = (item: any) => {
  currencyStore.selectCurrency(item)
  selectedCurrencyChains.value = item.chains
  isEditOpen.value = true
}

const closeEditModal = () => {
  isEditOpen.value = false
  currencyStore.selectCurrency(null)
}

// Load currencies
onMounted(async () => {
  if (currencyStore.currencies.length === 0) {
    currencyStore.loading = true
    await currencyStore.fetchCurrencies()
    currencyStore.loading = false
  }
})

function updateSelectedCurrenciesStatus(status: boolean) {
  currencyStore
    .updateCurrenciesStatus(selected.value, status)
    .then((response) => {
      if (response.status === 'success') {
        toast.success(response as any)
      } else {
        toast.danger(response as any)
      }
      selected.value = []
    })
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter currencies..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
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
          class="w-full"
          to="/admin/settings/exchange"
          flavor="outline"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4" />
          <span>{{ $t('Back') }}</span>
        </BaseButton>
      </template>
      <div>
        <template v-if="!currencyStore.loading && paginatedItems?.length === 0">
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
            class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full"
            v-if="!currencyStore.loading && selected.length > 0"
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
                @click="() => updateSelectedCurrenciesStatus(false)"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="success"
                size="xs"
                data-nui-tooltip="Enable currencies"
                @click="() => updateSelectedCurrenciesStatus(true)"
              >
                <Icon name="line-md:confirm" class="h-5 w-5" />
              </TairoButtonIcon>
            </div>
          </div>
          <TairoFlexTable class="md:pt-0 sm:pt-5 md:mt-0 sm:mt-5">
            <template #header>
              <div class="relative">
                <span class="pl-4">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    name="table-1-main"
                    shape="rounded"
                    class="text-primary-500"
                    @click="toggleAllVisibleSelection"
                  />
                </span>
              </div>
            </template>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <TairoFlexTableRow
                v-if="currencyStore.loading"
                v-for="index in 5"
                :key="index"
              >
                <TairoFlexTableCell
                  type="grow"
                  class="md:justify-start"
                  data-content="Symbol"
                >
                  <BasePlaceload
                    class="h-[46px] w-[46px] shrink-0 rounded-xl"
                  />
                </TairoFlexTableCell>
                <TairoFlexTableCell
                  class="text-end md:text-start"
                  data-content="Status"
                  light
                >
                  <BasePlaceload class="h-3 w-24 rounded-lg" />
                </TairoFlexTableCell>
                <TairoFlexTableCell
                  type="grow"
                  class="md:justify-end text-end"
                  data-content="Actions"
                >
                  <BasePlaceload class="h-8 w-16 rounded-lg" />
                </TairoFlexTableCell>
              </TairoFlexTableRow>

              <TableFlexTableRow
                v-else
                v-for="(item, index) in paginatedItems"
                :key="items.id"
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
                    label="Currency"
                    :hide-label="index > 0"
                    :logo="`/img/crypto/${item.currency.toLowerCase()}.png`"
                    :title="item.currency"
                    :subtitle="item.name"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Price"
                    :hide-label="index > 0"
                    class="w-full sm:w-40"
                  >
                    {{ item.price }} USDT
                  </TableFlexTableCell>
                  <TableFlexTableCell label="Status" :hide-label="index > 0">
                    <BaseTag
                      :color="item.status ? 'success' : 'danger'"
                      flavor="pastel"
                    >
                      {{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell label="action" :hide-label="index > 0">
                    <TairoButtonIcon
                      condensed
                      color="warning"
                      flavor="outline"
                      @click="openEditModal(item)"
                      data-nui-tooltip="Edit currency"
                    >
                      <Icon name="line-md:edit-twotone" class="h-4 w-4" />
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
            :item-per-page="perPage"
            :current-page="page"
          />
        </div>
      </div>
    </TairoContentWrapper>

    <TairoModal :open="isEditOpen" size="sm" @close="closeEditModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Currency') }}
          </h3>
          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <div
            v-for="chain in selectedCurrencyChains"
            :key="chain.network"
            class="mb-4"
          >
            <BaseInput
              v-model="chain.withdrawFee"
              :disabled="isSubmitting"
              type="number"
              :label="`${chain.network} Withdraw Fee`"
              placeholder="Enter withdraw fee"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isEditOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="update"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
