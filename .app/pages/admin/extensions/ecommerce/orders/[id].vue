<script setup lang="ts">
import { useAdminEcommerceOrdersStore } from '~~/store/extensions/ecommerce/admin/orders'
import type { EcommerceOrder } from '~~/types'

definePageMeta({
  permissions: ['View Ecommerce Orders'],
  title: 'Ecommerce Orders',
})

const adminOrdersStore = useAdminEcommerceOrdersStore()
const { getAdminOrder, updateAdminOrderItem } = useEcommerce()
const route = useRoute()
const { id } = route.params
const order: Ref<EcommerceOrder | null> = ref(null)
const items = computed(() => order.value?.order_items)

onMounted(async () => {
  await fetchOrder()
})

const fetchOrder = async () => {
  const response = await getAdminOrder(id)
  order.value = response.data.result
}

const { toast } = useUtils()
const isKeyModalOpen = ref(false)
const key = ref('')
const orderItem = ref(null)
const openKeyModal = (item) => {
  orderItem.value = item
  key.value = item.key ?? ''
  isKeyModalOpen.value = true
}
const closeModal = () => {
  orderItem.value = null
  key.value = ''
  isKeyModalOpen.value = false
}
const isSubmitting = ref(false)
const onSubmit = async () => {
  isSubmitting.value = true
  try {
    const response = await updateAdminOrderItem(orderItem.value?.id, key.value)
    toast.response(response)
    if (response.status === 'success') {
      await fetchOrder()
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
        <BaseHeading size="lg">
          {{ $t('Order') }} #{{ order?.id }} Items
        </BaseHeading>
      </template>
      <template #right>
        <BaseButton
          type="button"
          color="muted"
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          :to="'/admin/extensions/ecommerce/orders'"
        >
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div>
        <template v-if="items?.length === 0">
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
              v-for="(item, index) in items"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Customer"
                  :hide-label="index > 0"
                  :logo="item.product?.image"
                  :title="item.product?.name"
                  :subtitle="item.product?.type"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="
                      item.type === 'DOWNLOADABLE'
                        ? 'success'
                        : item.key
                          ? 'success'
                          : 'warning'
                    "
                    flavor="pastel"
                    condensed
                  >
                    {{
                      item.type === 'DOWNLOADABLE'
                        ? 'Completed'
                        : item.key
                          ? 'Completed'
                          : 'Pending'
                    }}
                  </BaseTag>
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Key"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  {{
                    item.type === 'DOWNLOADABLE'
                      ? item.product?.file_path
                      : item.key ?? 'N/A'
                  }}
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="openKeyModal(item)"
                      title="Add Key"
                    >
                      <template #start>
                        <Icon
                          name="solar:key-bold-duotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isKeyModalOpen" size="lg" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Add Key') }}
          </h3>
          <BaseButtonClose @click="isKeyModalOpen = false" />
        </div>
      </template>
      <div class="px-4 md:px-6 space-y-5">
        <BaseInput
          v-model="key"
          :placeholder="$t('Purchase Key')"
          :label="$t('Purchase Key')"
          :disabled="isSubmitting"
        />
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isKeyModalOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="onSubmit"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Submit') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
