<script setup lang="ts">
import { useAdminP2PEscrowStore } from '~~/store/extensions/p2p/admin/escrows'
import type { P2PEscrow } from '~~/types'

definePageMeta({
  permissions: ['View P2P Escrows'],
  title: 'P2P Escrows',
})

const p2pEscrowStore = useAdminP2PEscrowStore()
const { updateAdminP2PEscrow } = useP2P()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  p2pEscrowStore.escrows.filter(
    (escrow) =>
      escrow.status?.toLowerCase().includes(filter.value.toLowerCase()),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (p2pEscrowStore.escrows.length === 0) {
    p2pEscrowStore.loading = true
    await p2pEscrowStore.fetchP2PEscrows()
    p2pEscrowStore.loading = false
  }
})

const { toast } = useUtils()

// Update status modal
const isUpdateStatusOpen = ref(false)
const isUpdatingStatus = ref(false)
const selectedItem = ref<P2PEscrow | null>(null)

function openUpdateStatusModal(escrow: P2PEscrow) {
  selectedItem.value = escrow
  isUpdateStatusOpen.value = true
}

async function updateEscrowStatus(newStatus: string) {
  if (!selectedItem.value) return
  isUpdatingStatus.value = true
  try {
    await updateAdminP2PEscrow(selectedItem.value.id, newStatus)
    toast.success('Escrow status updated successfully')
    // Update the escrow status in the store or refetch the escrows
  } catch (error) {
    toast.error('Failed to update escrow status')
  }
  isUpdateStatusOpen.value = false
  isUpdatingStatus.value = false
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
          placeholder="Filter escrows..."
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
      <div>
        <template v-if="!p2pEscrowStore.loading && paginatedItems.length === 0">
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
              v-for="(escrow, index) in paginatedItems"
              :key="escrow.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Escrow"
                  :hide-label="index > 0"
                  :title="`ID: ${escrow.id}`"
                  :subtitle="`Amount: ${escrow.amount}`"
                />
              </template>
              <template #end>
                <TableFlexTableCell label="Status" :hide-label="index > 0">
                  {{ escrow.status }}
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      @click="viewEscrowDetails(escrow)"
                      title="View Details"
                    >
                      <!-- Icon and Label for View -->
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      @click="openUpdateStatusModal(escrow)"
                      title="Update Status"
                    >
                      <!-- Icon and Label for Update Status -->
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
      :open="isUpdateStatusOpen"
      size="sm"
      @close="() => (isUpdateStatusOpen = false)"
    >
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Update Escrow Status') }}
          </h3>
          <BaseButtonClose @click="() => (isUpdateStatusOpen = false)" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{
              $t('Are you sure you want to update the status of this escrow?')
            }}
          </h3>
          <!-- Additional content for updating status -->
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="() => (isUpdateStatusOpen = false)">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="updateEscrowStatus('newStatus')"
              :disabled="isUpdatingStatus"
              :loading="isUpdatingStatus"
            >
              {{ $t('Update Status') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
