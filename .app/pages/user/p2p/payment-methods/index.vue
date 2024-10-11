<script setup lang="ts">
import { useUserPaymentMethodsStore } from '~~/store/extensions/p2p/user/payment-methods'
import type { P2PPaymentMethod } from '~~/types'

definePageMeta({
  title: 'Payment Methods',
})

const paymentMethodStore = useUserPaymentMethodsStore()
const { deleteUserPaymentMethod } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  paymentMethodStore.methods.filter(
    (method) => method.name?.toLowerCase().includes(filter.value.toLowerCase()),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (paymentMethodStore.methods.length === 0) {
    paymentMethodStore.loading = true
    await paymentMethodStore.fetchPaymentMethods()
    paymentMethodStore.loading = false
  }
})

const { toast } = useUtils()
const router = useRouter()

function selectMethod(item: P2PPaymentMethod) {
  paymentMethodStore.selectPaymentMethod(item)
  router.push(`/user/p2p/payment-methods/edit/${item.id}`)
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<P2PPaymentMethod | null>(null)

function openDeleteModal(method: P2PPaymentMethod) {
  selectedItem.value = method
  isDeleteOpen.value = true
}

async function deleteMethod() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    const response = await deleteUserPaymentMethod(selectedItem.value.id)
    toast.response(response)
    if (response.status === 'success') {
      await paymentMethodStore.fetchPaymentMethods()
    }
  } catch (error) {
    toast.danger(error)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}
</script>
<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter methods..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{ wrapper: 'w-full sm:w-40' }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <template #right>
        <BaseButton
          color="primary"
          flavor="solid"
          to="/user/p2p/payment-methods/create"
        >
          <Icon name="line-md:plus" class="me-2 block h-5 w-5" />
          {{ $t('Create') }}
        </BaseButton>
      </template>
      <div>
        <template
          v-if="!paymentMethodStore.loading && paginatedItems.length === 0"
        >
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any payment gateways here yet.'
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
                  label="Method"
                  :hide-label="index > 0"
                  :picture="item.image || '/img/placeholder.png'"
                  :title="item.name"
                  :subtitle="
                    item.instructions.length > 50
                      ? item.instructions.slice(0, 50) + '...'
                      : item.instructions
                  "
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  :hide-label="index > 0"
                  class="w-24 xs:w-full"
                  label="Currency"
                >
                  {{ item.currency }}
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="selectMethod(item)"
                      title="Edit Method"
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
                      title="Delete Method"
                    >
                      <template #start>
                        <Icon name="line-md:close" class="me-2 block h-5 w-5" />
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
    <TairoModal
      :open="isDeleteOpen"
      size="sm"
      @close="() => (isDeleteOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete Method') }}
          </h3>
          <BaseButtonClose @click="() => (isDeleteOpen = false)" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure you want to delete this method?') }}
          </h3>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isDeleteOpen = false)">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="danger"
              flavor="solid"
              @click="deleteMethod"
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
