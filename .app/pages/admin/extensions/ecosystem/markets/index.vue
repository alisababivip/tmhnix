<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { useRoute } from 'vue-router'
import { z } from 'zod'
import type { EcosystemMarket, EcosystemToken } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Markets'],
  title: 'Ecosystem Markets',
})

const {
  getTokens,
  createMarket,
  updateMarket,
  adminDeleteMarket,
  getAdminMarkets,
  updateMarketsStatus,
} = useEcosystem()

// General Constants
const markets = ref<EcosystemMarket[]>([])
const route = useRoute()
const { toast } = useUtils()
const tokens = ref<EcosystemToken[]>([])
const tokenList = computed(() => {
  const uniqueTokens = new Set(tokens.value.map((item) => item.currency))
  return Array.from(uniqueTokens)
})
const loading = ref(false)

const selectedMarket = ref<EcosystemMarket | null>(null)

// Pagination Constants
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

// Modals Constants
const isModelOpen = ref(false)

// Filter
const items = computed(() => {
  if (markets.value && Array.isArray(markets.value)) {
    return markets.value.filter((item) => item.symbol.includes(filter.value))
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

const fetchMarkets = async () => {
  loading.value = true
  const response = await getAdminMarkets()
  markets.value = response.data.result
  loading.value = false
}
onMounted(async () => {
  if (markets.value.length === 0) {
    await fetchMarkets()
  }
  const response = await getTokens()
  if (response.status === 'success') {
    tokens.value = response.data.result
  }
})

// Validation
const zodSchema = z.object({
  metadata: z.object({
    limits: z.object({
      amount: z
        .object({
          min: z.number().gt(0),
          max: z.number().optional().nullable(),
        })
        .refine((data) => !data.max || data.max > data.min, {
          message: 'Max must be greater than Min for Amount',
          path: ['limits', 'amount'],
        }),
      price: z
        .object({
          min: z.number().gt(0),
          max: z.number().optional().nullable(),
        })
        .refine((data) => !data.max || data.max > data.min, {
          message: 'Max must be greater than Min for Price',
          path: ['limits', 'price'],
        }),
      cost: z
        .object({
          min: z.number().min(0),
          max: z.number().optional().nullable(),
        })
        .refine((data) => !data.max || data.max > data.min, {
          message: 'Max must be greater than Min for Cost',
          path: ['limits', 'cost'],
        }),
    }),
    precision: z.object({
      amount: z.number().min(0).max(8),
      price: z.number().min(0).max(8),
    }),
    taker: z.number().min(0).max(100),
    maker: z.number().min(0).max(100),
  }),
  is_trending: z.boolean().optional().nullable(),
  is_hot: z.boolean().optional().nullable(),
})
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  metadata: {
    limits: {
      amount: {
        min: selectedMarket.value?.metadata?.limits?.amount?.min ?? 0,
        max: selectedMarket.value?.metadata?.limits?.amount?.max ?? null,
      },
      price: {
        min: selectedMarket.value?.metadata?.limits?.price?.min ?? 0,
        max: selectedMarket.value?.metadata?.limits?.price?.max ?? null,
      },
      cost: {
        min: selectedMarket.value?.metadata?.limits?.cost?.min ?? 0,
        max: selectedMarket.value?.metadata?.limits?.cost?.max ?? null,
      },
    },
    precision: {
      amount: selectedMarket.value?.metadata?.precision?.amount ?? 0,
      price: selectedMarket.value?.metadata?.precision?.price ?? 0,
    },
    taker: selectedMarket.value?.metadata?.taker ?? 0,
    maker: selectedMarket.value?.metadata?.maker ?? 0,
  },
  is_trending: selectedMarket.value?.is_trending ?? false,
  is_hot: selectedMarket.value?.is_hot ?? false,
}))

const isNew = ref(false)
const createMarketSchema = zodSchema
  .extend({
    currency: z.string().nonempty('Please select a currency'),
    pair: z.string().nonempty('Please select a pair'),
  })
  .refine((data) => data.currency !== data.pair, {
    message: 'Currency and Pair must be different',
    path: ['currency', 'pair'],
  })

const {
  handleSubmit,
  isSubmitting,
  meta,
  resetForm,
  setFieldValue,
  values,
  errors,
} = useForm({
  validationSchema: computed(() => {
    return toTypedSchema(isNew.value ? createMarketSchema : zodSchema)
  }),
  initialValues,
})

// Edit
const submit = handleSubmit(async (values: any) => {
  let response
  if (isNew.value) {
    if (
      markets.value.find(
        (m) =>
          m.symbol === values.currency + '/' + values.pair ||
          m.symbol === values.pair + '/' + values.currency,
      ) !== undefined
    ) {
      isNew.value = false
      isModelOpen.value = false
      toast.dangerText('Market already exists')
      return
    }
    response = await createMarket(
      values.currency,
      values.pair,
      values.metadata,
      values.is_trending,
      values.is_hot,
    )
  } else {
    if (!selectedMarket.value) {
      return
    }
    response = await updateMarket(
      selectedMarket.value?.id,
      values.metadata,
      values.is_trending,
      values.is_hot,
    )
  }
  toast.response(response)
  if (response.status === 'success') {
    await fetchMarkets()
  }
  isModelOpen.value = false
  selectedMarket.value = null
  resetForm()
})

const openModal = (item: any) => {
  selectedMarket.value = item
  if (item !== null) {
    setFieldValue('metadata.limits.amount.min', item.metadata.limits.amount.min)
    setFieldValue('metadata.limits.amount.max', item.metadata.limits.amount.max)
    setFieldValue('metadata.limits.price.min', item.metadata.limits.price.min)
    setFieldValue('metadata.limits.price.max', item.metadata.limits.price.max)
    setFieldValue('metadata.limits.cost.min', item.metadata.limits.cost.min)
    setFieldValue('metadata.limits.cost.max', item.metadata.limits.cost.max)
    setFieldValue('metadata.precision.amount', item.metadata.precision.amount)
    setFieldValue('metadata.precision.price', item.metadata.precision.price)
    setFieldValue('metadata.taker', item.metadata.taker)
    setFieldValue('metadata.maker', item.metadata.maker)
    setFieldValue('is_trending', item.is_trending)
    setFieldValue('is_hot', item.is_hot)
    isNew.value = false
  } else {
    isNew.value = true
  }
  isModelOpen.value = true
}

const closeModal = () => {
  isModelOpen.value = false
  selectedMarket.value = null
  resetForm()
}

async function updateSelectedMarketsStatus(status: boolean) {
  const response = await updateMarketsStatus(selected.value, status)

  toast.response(response as any)
  if (response.status === 'success') {
    markets.value = markets.value?.map((market) =>
      selected.value.includes(market.id) ? { ...market, status } : market,
    )
    selected.value = []
  }
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  selectedMarket.value = item
  isDeleteOpen.value = true
}

async function deleteMarket() {
  if (!selectedMarket.value) {
    return
  }
  isDeleting.value = true
  try {
    const response = await adminDeleteMarket(selectedMarket.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      await fetchMarkets()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedMarket.value = null
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
          color="success"
          class="w-full"
          @click="openModal(null)"
          flavor="outline"
        >
          <Icon name="line-md:plus" class="h-4 w-4" />
          <span>{{ $t('Create') }}</span>
        </BaseButton>
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

        <div v-else class="w-full">
          <div
            class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full mb-5"
            v-if="!loading && selected.length > 0"
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
                <TableFlexTableCell label="Status" :hide-label="index > 0">
                  <BaseTag
                    :color="item.status ? 'success' : 'danger'"
                    flavor="pastel"
                  >
                    {{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                  >
                </TableFlexTableCell>

                <TableFlexTableCell
                  label="action"
                  :hide-label="index > 0"
                  class="flex gap-2"
                >
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      :to="`/admin/extensions/ecosystem/markets/orders?symbol=${item.symbol}`"
                      title="View Orders"
                    >
                      <template #start>
                        <Icon
                          name="mdi:reorder-horizontal"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openModal(item)"
                      title="Edit Market"
                    >
                      <template #start>
                        <Icon
                          name="line-md:edit-twotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openDeleteModal(item)"
                      title="Delete Market"
                    >
                      <template #start>
                        <Icon name="line-md:close" class="me-2 block h-5 w-5" />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                  <TairoButtonIcon
                    :color="item.showDetails ? 'info' : 'muted'"
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
                <div class="px-2 pt-5 flex flex-wrap gap-2">
                  <BaseCard class="p-2 w-auto max-w-xs">
                    <strong>Amount Limits:</strong>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Min:</strong>
                      {{ item.metadata.limits.amount.min }}
                      {{ item.symbol.split('/')[0] }}
                    </span>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Max:</strong>
                      {{ item.metadata.limits.amount.max ?? '∞' }}
                      {{ item.symbol.split('/')[0] }}
                    </span>
                  </BaseCard>
                  <BaseCard class="p-2 w-auto max-w-xs">
                    <strong>Price Limits:</strong>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Min:</strong> {{ item.metadata.limits.price.min }}
                      {{ item.symbol.split('/')[0] }}
                    </span>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Max:</strong>
                      {{ item.metadata.limits.price.max ?? '∞' }}
                      {{ item.symbol.split('/')[0] }}
                    </span>
                  </BaseCard>
                  <BaseCard class="p-2 w-auto max-w-xs">
                    <strong>Cost Limits:</strong>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Min:</strong> {{ item.metadata.limits.cost.min }}
                      {{ item.pair }}
                    </span>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Max:</strong>
                      {{ item.metadata.limits.cost.max ?? '∞' }}
                      {{ item.pair }}
                    </span>
                  </BaseCard>
                  <BaseCard class="p-2 w-auto max-w-xs">
                    <strong>Precision (Digits):</strong>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Amount:</strong>
                      {{ item.metadata.precision.amount }}
                    </span>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Price:</strong>
                      {{ item.metadata.precision.price }}
                    </span>
                  </BaseCard>
                  <BaseCard class="p-2 w-auto max-w-xs">
                    <strong>Fees:</strong>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Taker:</strong> {{ item.metadata.taker }} %
                    </span>
                    <br />
                    <span class="ml-2 text-sm">
                      <strong>Maker:</strong> {{ item.metadata.maker }} %
                    </span>
                  </BaseCard>
                </div>
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

    <TairoModal :open="isModelOpen" size="2xl" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ isNew ? $t('Create Market') : $t('Edit Market') }}
          </h3>
          <BaseButtonClose @click="isModelOpen = false" />
        </div>
      </template>
      <div class="px-4 md:px-6">
        <div class="grid grid-cols-2 gap-3">
          <Field
            v-if="isNew"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="currency"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="tokenList.filter((item) => item !== values.pair)"
              placeholder="Please select a currency"
              label="Currency"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-if="isNew"
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="pair"
          >
            <BaseListbox
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :items="tokenList.filter((item) => item !== values.currency)"
              placeholder="Please select a pair"
              label="Pair"
              shape="rounded"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.amount.min"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Minimum Amount"
              placeholder="Enter min amount"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.amount.max"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Maximum Amount"
              placeholder="Optional max amount"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.price.min"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Minimum Price"
              placeholder="Enter min price"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.price.max"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Maximum Price"
              placeholder="Optional max price"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.cost.min"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Minimum Cost"
              placeholder="Enter min cost"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.limits.cost.max"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Maximum Cost"
              placeholder="Optional max cost"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.precision.amount"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Amount Precision"
              placeholder="Enter amount precision"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.precision.price"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Price Precision"
              placeholder="Enter price precision"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.taker"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Taker Fee"
              placeholder="Enter taker fee"
              icon="iconoir:percentage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="metadata.maker"
          >
            <BaseInput
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="number"
              label="Maker Fee"
              placeholder="Enter maker fee"
              icon="iconoir:percentage"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="is_trending"
          >
            <BaseCheckbox
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :name="`is_trending`"
              shape="rounded"
              class="text-primary-500"
              label="Trending"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>

          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="is_hot"
          >
            <BaseCheckbox
              v-model="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :name="`is_hot`"
              shape="rounded"
              class="text-primary-500"
              label="Hot"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isModelOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="submit"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ isNew ? $t('Create') : $t('Update') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ selectedMarket?.symbol }} {{ $t('Market') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Do you really want to delete this') }}
            {{ $t('market') }}? {{ $t('This process cannot be undone') }}.
            {{
              $t(
                'all the data related to this market will be deleted permanently including orders, trades, orderbook, etc.',
              )
            }}
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isDeleteOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteMarket()"
              :disabled="isDeleting"
              :loading="isDeleting"
            >
              {{ $t('Delete') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
