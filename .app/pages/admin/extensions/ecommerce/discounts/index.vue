<script setup lang="ts">
import { useAdminEcommerceDiscountsStore } from '~~/store/extensions/ecommerce/admin/discounts'
import type { EcommerceDiscount } from '~~/types'

definePageMeta({
  permissions: ['View Ecommerce Discounts'],
  title: 'Ecommerce Discounts',
})

const adminDiscountsStore = useAdminEcommerceDiscountsStore()
const { deleteAdminDiscount } = useEcommerce()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1', 10))

const items = computed(() =>
  adminDiscountsStore.discounts.filter((discount) =>
    discount.code.toLowerCase().includes(filter.value.toLowerCase()),
  ),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (adminDiscountsStore.discounts.length === 0) {
    adminDiscountsStore.loading = true
    await adminDiscountsStore.fetchDiscounts()
    adminDiscountsStore.loading = false
  }
})

const { toast } = useUtils()
const router = useRouter()

function selectDiscount(discount: EcommerceDiscount) {
  adminDiscountsStore.selectDiscount(discount)
  router.push(`/admin/extensions/ecommerce/discounts/edit/${discount.id}`)
}

// Delete modal logic
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref<EcommerceDiscount | null>(null)

function openDeleteModal(discount: EcommerceDiscount) {
  selectedItem.value = discount
  isDeleteOpen.value = true
}

async function deleteDiscountById() {
  if (!selectedItem.value) return
  isDeleting.value = true
  try {
    const response = await deleteAdminDiscount(selectedItem.value.id)
    toast.response(response)
    if (response.status === 'success') {
      adminDiscountsStore.removeDiscount(selectedItem.value.id)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  selectedItem.value = null
}

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'EXPIRED':
      return 'danger'
    case 'UPCOMING':
      return 'warning'
    default:
      return 'info'
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
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter discounts..."
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
          color="primary"
          :to="`/admin/extensions/ecommerce/discounts/create`"
        >
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Create') }} Discount
        </BaseButton>
      </template>
      <div>
        <template
          v-if="!adminDiscountsStore.loading && paginatedItems.length === 0"
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
              v-for="(discount, index) in paginatedItems"
              :key="discount.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Code"
                  :hide-label="index > 0"
                  :title="discount.code"
                  :subtitle="`Valid Until ${formatDate(discount.valid_until)}`"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Product"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full text-xs"
                  >{{ discount.product?.name }}</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Discount"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ discount.percentage }}%</TableFlexTableCell
                >
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="statusClass(discount.status)"
                    flavor="pastel"
                    condensed
                    >{{ discount.status }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Actions"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="selectDiscount(discount)"
                      title="Edit Discount"
                    >
                      <template #start>
                        <Icon
                          name="line-md:edit-twotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>

                    <BaseDropdownItem
                      @click="openDeleteModal(discount)"
                      title="Delete Discount"
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

    <TairoModal :open="isDeleteOpen" size="sm" @close="isDeleteOpen = false">
      <!-- Delete confirmation UI -->
      <template #header>
        <div class="flex items-center justify-between p-4">
          <h3 class="text-lg font-medium">
            {{ $t('Delete') }} {{ $t('Discount') }}
          </h3>
          <BaseButtonClose @click="isDeleteOpen = false" />
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
                'Do you really want to delete this discount? This process cannot be undone.',
              )
            }}
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-x-2 p-4">
          <BaseButton @click="isDeleteOpen = false">
            {{ $t('Cancel') }}
          </BaseButton>
          <BaseButton
            color="danger"
            @click="deleteDiscountById()"
            :disabled="isDeleting"
            :loading="isDeleting"
          >
            {{ $t('Delete') }}
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
