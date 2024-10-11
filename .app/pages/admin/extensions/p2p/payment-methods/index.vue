<script setup lang="ts">
import { useAdminPaymentMethodsStore } from '~~/store/extensions/p2p/admin/payment-methods'

definePageMeta({
  permissions: ['View Payment Methods'],
  title: 'Payment Methods',
})

const paymentMethodStore = useAdminPaymentMethodsStore()
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
      </template>
      <template #right>
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
                  label="Method"
                  :hide-label="index > 0"
                  :title="item.name"
                  :subtitle="item.user?.first_name + ' ' + item.user?.last_name"
                  :picture="item.image || '/img/placeholder.png'"
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
                <TableFlexTableCell
                  label="Offers"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  {{ item.offer?.length ?? 0 }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="item.status ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{ item.status ? $t('Active') : $t('Inactive') }}</BaseTag
                  >
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
  </div>
</template>
