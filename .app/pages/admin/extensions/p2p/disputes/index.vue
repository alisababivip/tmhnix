<script setup lang="ts">
import { useAdminP2PDisputesStore } from '~~/store/extensions/p2p/admin/disputes'
import type { P2POfferDispute } from '~~/types'

definePageMeta({
  permissions: ['View P2P Disputes'],
  title: 'P2P Disputes',
})

const p2pDisputeStore = useAdminP2PDisputesStore()
const { resolveAdminP2PDispute } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pDisputeStore.disputes.filter(
    (dispute) => dispute.reason?.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pDisputeStore.disputes.length === 0) {
    p2pDisputeStore.loading = true
    await p2pDisputeStore.fetchP2PDisputes()
    p2pDisputeStore.loading = false
  }
})

const { toast } = useUtils()

// Resolution modal
const isResolveOpen = ref(false)
const isResolving = ref(false)
const selectedItem = ref<P2POfferDispute | null>(null)

function openResolveModal(dispute: P2POfferDispute) {
  selectedItem.value = dispute
  isResolveOpen.value = true
}

async function resolveDispute() {
  if (!selectedItem.value) return
  isResolving.value = true
  try {
    await resolveAdminP2PDispute(selectedItem.value.id, 'resolved')
    toast.success('Dispute resolved successfully')
    // Update the dispute status in the store or refetch the disputes
  } catch (error) {
    toast.error('Failed to resolve dispute')
  }
  isResolveOpen.value = false
  isResolving.value = false
  selectedItem.value = null
}

const status = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_PROGRESS':
      return 'info'
    case 'RESOLVED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'default'
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
          :classes="{ wrapper: 'w-full sm:w-auto' }"
          placeholder="Filter disputes..."
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
          v-if="!p2pDisputeStore.loading && paginatedItems.length === 0"
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
                  label="Dispute"
                  :hide-label="index > 0"
                  :title="`Trade ID: ${item.trade?.uuid}`"
                  :subtitle="`Reason: ${item.reason}`"
                />
              </template>
              <template #end>
                <TableFlexTableStart
                  label="Raised By"
                  :hide-label="index > 0"
                  :logo="item.raised_by?.avatar"
                  :title="`${item.raised_by?.first_name} ${item.raised_by?.last_name}`"
                  :subtitle="item.raised_by?.uuid"
                />
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-28 xs:w-full"
                >
                  <BaseTag :color="status(item?.status)" flavor="pastel">
                    {{ item?.status }}
                  </BaseTag>
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      :to="`/admin/extensions/p2p/disputes/${item.id}`"
                      title="View Details"
                    >
                      <Icon name="mdi:eye" class="w-4 h-4 mr-2" />
                      {{ $t('View') }}
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openResolveModal(item)"
                      title="Resolve Dispute"
                    >
                      <Icon name="line-md:close" class="w-4 h-4 mr-2" />
                      {{ $t('Resolve') }}
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
      :open="isResolveOpen"
      size="sm"
      @close="() => (isResolveOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Resolve Dispute') }}
          </h3>
          <BaseButtonClose @click="() => (isResolveOpen = false)" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure you want to resolve this dispute?') }}
          </h3>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isResolveOpen = false)">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="resolveDispute"
              :disabled="isResolving"
              :loading="isResolving"
            >
              {{ $t('Resolve') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
