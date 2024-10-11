<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { useRoute } from 'vue-router'
import { z } from 'zod'

definePageMeta({
  permissions: ['Access Exchange Markets'],
  title: 'Exchange Markets',
})

const marketStore = useMarketStore()

// General Constants
const route = useRoute()
const { toast } = useUtils()

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isEditOpen = ref(false)

// Filter
const items = computed(() => {
  if (marketStore.markets && Array.isArray(marketStore.markets)) {
    return marketStore.markets.filter((item) =>
      item.symbol.includes(filter.value),
    )
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

// Validation
const zodSchema = z.object({
  taker: z.number().min(0.0001).max(100),
  maker: z.number().min(0.0001).max(100),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  taker: 0.001,
  maker: 0.001,
}))

const { handleSubmit, isSubmitting, meta, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const is_trending = ref(false)
const is_hot = ref(false)

// Edit
const update = handleSubmit(async (values: any) => {
  // Check if there are any changes
  if (
    JSON.stringify(values.taker) ===
      JSON.stringify(marketStore.selectedMarket?.metadata?.taker) &&
    JSON.stringify(values.maker) ===
      JSON.stringify(marketStore.selectedMarket?.metadata?.maker) &&
    is_trending.value === marketStore.selectedMarket?.is_trending &&
    is_hot.value === marketStore.selectedMarket?.is_hot
  ) {
    toast.info('No changes detected.')
    isEditOpen.value = false
    marketStore.selectMarket(null)
    return
  }

  const metadata = {
    taker: values.taker,
    maker: values.maker,
  }

  const response = await marketStore.updateMarket(
    marketStore.selectedMarket?.id as number,
    metadata,
    is_trending.value,
    is_hot.value,
  )
  if (response.status === 'success') {
    toast.success(response as any)
  } else {
    toast.danger(response as any)
  }
  isEditOpen.value = false
  marketStore.selectMarket(null)
  resetForm()
})

const openEditModal = (item: any) => {
  marketStore.selectMarket(item)
  setFieldValue('taker', item.metadata.taker)
  setFieldValue('maker', item.metadata.maker)
  is_trending.value = item.is_trending
  is_hot.value = item.is_hot
  isEditOpen.value = true
}

const closeEditModal = () => {
  isEditOpen.value = false
  marketStore.selectMarket(null)
  resetForm()
}

function updateSelectedMarketsStatus(status: boolean) {
  marketStore.updateMarketsStatus(selected.value, status).then((response) => {
    if (response.status === 'success') {
      toast.success(response as any)
    } else {
      toast.danger(response as any)
    }
    selected.value = []
  })
}

onMounted(async () => {
  if (marketStore.markets.length === 0) {
    marketStore.loading = true
    await marketStore.fetchMarkets()
    marketStore.loading = false
  }
})

onBeforeMount(() => {
  window.addEventListener('beforeunload', beforeUnloadListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadListener)
})

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const beforeUnloadListener = (event: any) => {
  if (meta.value.dirty) {
    event.preventDefault()
    event.returnValue = ''
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter markets..."
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
        <template v-if="!marketStore.loading && paginatedItems?.length === 0">
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
            class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full mb-5"
            v-if="!marketStore.loading && selected.length > 0"
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
                @click="() => updateSelectedMarketsStatus(false)"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="success"
                size="xs"
                data-nui-tooltip="Enable currencies"
                @click="() => updateSelectedMarketsStatus(true)"
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

            <TableFlexTableRow
              v-if="marketStore.loading"
              v-for="index in 5"
              :key="index"
            >
              <TableFlexTableCell type="shrink" data-content="Selection">
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="selected"
                    :name="`placeload-item-checkbox-${index}`"
                    class="text-primary-500"
                  />
                </div>
              </TableFlexTableCell>
              <TableFlexTableCell
                type="grow"
                class="md:justify-start"
                data-content="Symbol"
              >
                <BasePlaceload class="h-[46px] w-[46px] shrink-0 rounded-xl" />
              </TableFlexTableCell>
              <TableFlexTableCell
                class="text-end md:text-start"
                data-content="Trending"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableFlexTableCell>
              <TableFlexTableCell
                class="text-end md:text-start"
                data-content="Hot"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableFlexTableCell>
              <TableFlexTableCell
                class="text-end md:text-start"
                data-content="Taker"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableFlexTableCell>
              <TableFlexTableCell
                class="text-end md:text-start"
                data-content="Maker"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableFlexTableCell>
              <TableFlexTableCell
                class="text-end md:text-start"
                data-content="Status"
                light
              >
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableFlexTableCell>
              <TableFlexTableCell
                type="grow"
                class="md:justify-end text-end"
                data-content="Actions"
              >
                <BasePlaceload class="h-8 w-16 rounded-lg" />
              </TableFlexTableCell>
            </TableFlexTableRow>

            <TableFlexTableRow
              v-else
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
                  label="Symbol"
                  :hide-label="index > 0"
                  :title="item.symbol"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Trending"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  <Icon
                    :name="
                      item.is_trending
                        ? 'line-md:circle-to-confirm-circle-twotone-transition'
                        : 'line-md:close-circle-twotone'
                    "
                    class="h-6 w-6"
                    :class="{
                      'text-danger-500': !item.is_trending,
                      'text-success-500': item.is_trending,
                    }"
                  />
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Hot"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  <Icon
                    :name="
                      item.is_hot
                        ? 'line-md:circle-to-confirm-circle-twotone-transition'
                        : 'line-md:close-circle-twotone'
                    "
                    class="h-6 w-6"
                    :class="{
                      'text-danger-500': !item.is_hot,
                      'text-success-500': item.is_hot,
                    }"
                  />
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Taker"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  {{ item.metadata?.taker }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Maker"
                  :hide-label="index > 0"
                  class="w-full sm:w-20"
                >
                  {{ item.metadata?.maker }}
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
                    data-nui-tooltip="Edit market"
                  >
                    <Icon name="line-md:edit-twotone" class="h-4 w-4" />
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

    <TairoModal :open="isEditOpen" size="sm" @close="closeEditModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Edit Market') }}
          </h3>
          <BaseButtonClose @click="isEditOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please update the market information') }}.
          </p>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="taker"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Taker Fees"
              placeholder="Enter market taker fees"
              :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="maker"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Maker Fees"
              placeholder="Enter market maker fees"
              :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <div class="flex justify-start gap-5 items-center mt-5">
            <BaseCheckbox
              v-model="is_trending"
              label="Trending"
              shape="rounded"
              color="success"
            />

            <BaseCheckbox
              v-model="is_hot"
              label="Hot"
              color="success"
              shape="rounded"
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
