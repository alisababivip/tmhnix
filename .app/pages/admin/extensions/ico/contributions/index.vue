<script setup lang="ts">
import { useIcoContributionStore } from '~~/store/extensions/ico/admin/contributions'
definePageMeta({
  permissions: ['View ICO Contributions'],
  title: 'ICO Contributions',
})

const icoContributionStore = useIcoContributionStore()
const { deleteIcoContribution, payIcoContribution } = useIco()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const router = useRouter()
const oldFilter = ref('')
const items = computed(() =>
  icoContributionStore.contributions
    .filter((log) => {
      // User Filter
      if (
        selectedUser.value &&
        selectedUser.value !== '' &&
        !log.user?.uuid?.includes(selectedUser.value)
      )
        return false

      // Status Filter
      if (
        selectedStatus.value &&
        selectedStatus.value !== 'All' &&
        log.status !== selectedStatus.value
      )
        return false

      // Date Range Filter
      if (fromDate.value && new Date(log.created_at) < new Date(fromDate.value))
        return false
      if (toDate.value && new Date(log.created_at) > new Date(toDate.value))
        return false

      // Reference ID Filter
      if (
        filter.value &&
        filter.value !== '' &&
        filter.value !== undefined &&
        filter.value !== oldFilter.value
      ) {
        router.push({
          query: {
            ...route.query,
            page: '1',
            filter: filter.value,
          },
        })
        oldFilter.value = filter.value
      }
      return !filter.value || log.uuid?.includes(filter.value)
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (icoContributionStore.contributions.length === 0) {
    icoContributionStore.loading = true
    await icoContributionStore.fetchIcoContributions()
    icoContributionStore.loading = false
  }
})

const filters = ref(false)
const fromDate = ref('')
const toDate = ref('')
const selectedStatus = ref('')
const selectedUser = ref('')
const transactionStatuses = [
  'All',
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
]
const { toast } = useUtils()

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deleteContribution() {
  isDeleting.value = true
  try {
    const response = await deleteIcoContribution(selectedItem.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      icoContributionStore.removeContribution(selectedItem.value?.id)
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
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'success'
    case 'COMPLETED':
      return 'info'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
  }
}

// pay contribution
const isPayOpen = ref(false)
const isPaying = ref(false)
const selectedPayItem = ref(null)

function openPayModal(item: any) {
  selectedPayItem.value = item
  isPayOpen.value = true
}

async function payContribution() {
  isPaying.value = true
  try {
    const response = await payIcoContribution(selectedPayItem.value?.id)
    toast.response(response)
    if (response.status === 'success') {
      await icoContributionStore.fetchIcoContributions()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isPayOpen.value = false
  isPaying.value = false
  selectedPayItem.value = null
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
          placeholder="Filter contributions..."
        />
        <BaseButton @click="filters = !filters" color="muted" block>
          <Icon v-if="filters" name="line-md:arrow-up" class="h-4 w-4 mr-2" />
          <Icon v-else name="line-md:arrow-down" class="h-4 w-4 mr-2" />
          {{ $t('Filters') }}
        </BaseButton>
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
        <TransitionGroup
          enter-active-class="transform-gpu"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="absolute transform-gpu"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <BaseCard
            :class="`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${numberOfFiltersToShow} lg:grid-cols-${
              numberOfFiltersToShow + 2
            } mb-6 p-5`"
            v-if="filters"
          >
            <!-- Transaction Type Dropdown -->
            <BaseInput
              v-model="selectedUser"
              label="User UUID"
              placeholder="Write the user uuid"
            />

            <!-- Status Dropdown -->
            <BaseListbox
              v-model="selectedStatus"
              label="Status"
              :items="transactionStatuses"
              placeholder="Select a Status"
            />

            <!-- Date Range Inputs -->
            <BaseInput v-model="fromDate" type="date" label="From" />
            <BaseInput v-model="toDate" type="date" label="To" />
          </BaseCard>
        </TransitionGroup>
        <template
          v-if="!icoContributionStore.loading && paginatedItems?.length === 0"
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
                  label="Item"
                  :hide-label="index > 0"
                  :picture="item.user?.avatar"
                  :title="`${item.user?.first_name} ${item.user?.last_name}`"
                  :subtitle="item.user?.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Tokens"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                  >{{ item.amount }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
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
                      @click="openPayModal(item)"
                      title="Pay Contribution"
                    >
                      <template #start>
                        <Icon
                          name="mingcute:card-pay-line"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      v-if="item.status === 'PENDING'"
                      @click="openDeleteModal(item)"
                      title="Refund Contribution"
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

    <!-- Pay modal -->
    <TairoModal :open="isPayOpen" size="sm" @close="isPayOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Pay') }} {{ $t('ICO Contribution') }}
          </h3>
          <BaseButtonClose @click="isPayOpen = false" />
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
            {{ $t('Do you really want to pay this') }}
            {{ $t('contribution') }}
            {{ $t('This process cannot be undone.') }}
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isPayOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="payContribution()"
              :disabled="isPaying"
              :loading="isPaying"
            >
              {{ $t('Pay') }}
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
            {{ $t('Delete') }} {{ $t('ICO Contribution') }}
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
            {{ $t('Do you really want to refund this') }}
            {{ $t('contribution') }}
            {{
              $t(
                'This process cannot be undone, it will permanently delete the',
              )
            }}
            {{ $t('contribution') }}
            {{ $t('and all related data and refund the balance to wallet') }}
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
              @click="deleteContribution()"
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
