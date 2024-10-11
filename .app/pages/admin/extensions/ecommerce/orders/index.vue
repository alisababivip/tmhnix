<script setup lang="ts">
import { useAdminEcommerceOrdersStore } from '~~/store/extensions/ecommerce/admin/orders'

definePageMeta({
  permissions: ['View Ecommerce Orders'],
  title: 'Ecommerce Orders',
})

const adminOrdersStore = useAdminEcommerceOrdersStore()
const { updateAdminOrderStatus } = useEcommerce()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(
  () =>
    adminOrdersStore.orders.filter(
      (order) =>
        order.id.toString().includes(filter.value) ||
        order.user.email?.includes(filter.value),
    ) ?? [],
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (adminOrdersStore.orders.length === 0) {
    adminOrdersStore.loading = true
    await adminOrdersStore.fetchOrders()
    adminOrdersStore.loading = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    default:
      return 'secondary'
  }
}

const { toast } = useUtils()
const isUpdateOpen = ref(false)
const isSubmitting = ref(false)
const closeModal = () => {
  isUpdateOpen.value = false
  selectedOrder.value = null
}
const selectedOrder = ref(null)
const updateModal = (item) => {
  selectedOrder.value = item
  isUpdateOpen.value = true
}
const updateStatus = async (item) => {
  isSubmitting.value = true
  try {
    const response = await updateAdminOrderStatus(
      selectedOrder.value?.id,
      'COMPLETED',
    )
    toast.response(response)
    if (response.status === 'success') {
      await adminOrdersStore.fetchOrders()
    }
  } catch (error) {
    toast.danger(error)
  }
  isSubmitting.value = false
  closeModal()
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
          placeholder="Filter orders..."
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
          v-if="!adminOrdersStore?.loading && paginatedItems?.length === 0"
        >
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching orders' : 'No orders found'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching orders for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any orders here yet.'
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
              v-for="(order, index) in paginatedItems"
              :key="order.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Customer"
                  :hide-label="index > 0"
                  :logo="order.user?.avatar"
                  :title="`${order.user?.first_name} ${order.user?.last_name}`"
                  :subtitle="formatDate(order.created_at)"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Order ID"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  #{{ order.id }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(order.status)"
                    flavor="pastel"
                    condensed
                  >
                    {{ order.status }}
                  </BaseTag>
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="updateModal(order)"
                      v-if="order.status !== 'COMPLETED'"
                      title="Mark as Completed"
                    >
                      <template #start>
                        <Icon name="mdi:check" class="me-2 block h-5 w-5" />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      :to="`/admin/extensions/ecommerce/orders/${order.id}`"
                      title="View Order Items"
                    >
                      <template #start>
                        <Icon name="mdi:eye" class="me-2 block h-5 w-5" />
                      </template>
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
    <TairoModal :open="isUpdateOpen" size="sm" @close="isUpdateOpen = false">
      <!-- Delete confirmation UI -->
      <template #header>
        <div class="flex items-center justify-between p-4">
          <h3 class="text-lg font-medium">Update Order</h3>
          <BaseButtonClose @click="isUpdateOpen = false" />
        </div>
      </template>
      <div class="p-4">
        <div class="text-center">
          <h3 class="text-lg font-medium">
            {{ $t('Are you sure?') }}
          </h3>
          <p class="text-sm my-3">
            {{
              $t(
                'Do you really want to mark this order as completed? Did you add the keys to the order items?',
              )
            }}
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-x-2 p-4">
          <BaseButton @click="isUpdateOpen = false">
            {{ $t('Cancel') }}
          </BaseButton>
          <BaseButton
            color="success"
            @click="updateStatus()"
            :disabled="isSubmitting"
            :loading="isSubmitting"
          >
            {{ $t('Update') }}
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
