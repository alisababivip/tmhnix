<script setup lang="ts">
import { useUserEcommerceOrdersStore } from '~~/store/extensions/ecommerce/user/orders'
import type { EcommerceOrder } from '~~/types'
definePageMeta({
  title: 'My Orders',
})

const ecommerceOrdersStore = useUserEcommerceOrdersStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const { formatedPrice } = useUtils()

const processedOrders = computed(() => {
  return ecommerceOrdersStore.orders.map((order) => {
    // If only one order item, add a reference to it for easy access
    if (order.order_items.length === 1) {
      return { ...order, singleItem: order.order_items[0] }
    }
    return order
  })
})

const items = computed(() =>
  processedOrders.value.filter((item) => item.uuid.includes(filter.value)),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (ecommerceOrdersStore.orders.length === 0) {
    ecommerceOrdersStore.loading = true
    await ecommerceOrdersStore.fetchOrders()
    ecommerceOrdersStore.loading = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
  }
}

const isKeyCardOpen = ref(false)
const selectedOrder = ref<EcommerceOrder | null>(null)
const openKeyModel = (item: EcommerceOrder) => {
  selectedOrder.value = item
  isKeyCardOpen.value = true
}

const closeModal = () => {
  selectedOrder.value = null
  isKeyCardOpen.value = false
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
          placeholder="Filter orderss UUID..."
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
          v-if="!ecommerceOrdersStore.loading && paginatedItems?.length === 0"
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
          <TairoFlexTable class="pt-5">
            <TableFlexTableRow
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Orders"
                  :hide-label="index > 0"
                  :logo="item.singleItem?.product?.image"
                  :title="item.singleItem?.product?.name"
                  :subtitle="formatDate(item.created_at)"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Price"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  ><span
                    v-if="item.singleItem?.product?.wallet_type !== 'FIAT'"
                  >
                    {{ item.singleItem?.product?.price }}
                    {{ item.singleItem?.product?.currency }}
                  </span>
                  <span v-else>
                    {{
                      formatedPrice(
                        item.singleItem?.product?.price,
                        item.singleItem?.product?.currency,
                      )
                    }}
                  </span>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(item.status)"
                    flavor="pastel"
                    condensed
                    >{{ item.status }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      v-if="item.singleItem?.product?.type === 'DOWNLOADABLE'"
                      :to="item.singleItem?.product?.file_path"
                      title="Download"
                    >
                      <template #start>
                        <Icon
                          name="line-md:download"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      v-show="item.singleItem?.product?.type === 'KEY'"
                      :disabled="item.status !== 'COMPLETED'"
                      @click="
                        item.status === 'COMPLETED' ? openKeyModel(item) : null
                      "
                      title="View Key"
                    >
                      <template #start>
                        <Icon
                          name="line-md:downloading-loop"
                          class="me-2 block h-5 w-5"
                          :class="{
                            'text-gray-400': item.status !== 'COMPLETED',
                          }"
                        />
                      </template>
                      {{
                        item.status === 'COMPLETED'
                          ? 'View Key'
                          : 'Key not available yet'
                      }}
                    </BaseDropdownItem>
                  </BaseDropdown>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
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

    <TairoModal :open="isKeyCardOpen" size="lg" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            View Order #{{ selectedOrder?.id }} Keys
          </h3>
          <BaseButtonClose @click="isKeyCardOpen = false" />
        </div>
      </template>
      <div class="px-4 md:px-6 pb-5">
        <div class="flex flex-col md:flex-row md:space-x-5">
          <div class="flex-1">
            <BaseInput
              :key="selectedOrder?.id"
              :modelValue="selectedOrder?.singleItem?.key ?? 'N/A'"
              readonly
              :label="selectedOrder?.singleItem?.product?.name"
            />
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
