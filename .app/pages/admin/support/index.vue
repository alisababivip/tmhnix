<script setup lang="ts">
import { useAdminSupportStore } from '~~/store/support/admin'

definePageMeta({
  permissions: ['Access Support Tickets'],
  title: 'Tickets',
})

const supportStore = useAdminSupportStore()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const route = useRoute()
const { toast } = useUtils()
const { deleteTicket } = useSupport()

const router = useRouter()
const oldFilter = ref('')
const statusParam = computed(() => route.query.status as string | undefined)
const importanceParam = computed(
  () => route.query.importance as string | undefined,
)

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const tickets = computed(() =>
  supportStore.tickets.filter((ticket) => ticket.user_id !== user.value?.id),
)

onMounted(async () => {
  loading.value = true

  if (supportStore.tickets.length === 0) {
    await supportStore.fetchTickets()
  }

  loading.value = false
})

const items = computed(() =>
  tickets.value
    .filter((ticket) => {
      // Status Filter
      if (
        selectedStatus.value &&
        selectedStatus.value !== 'All' &&
        ticket.status !== selectedStatus.value
      )
        return false

      // Importance Filter
      if (
        selectedImportance.value &&
        selectedImportance.value !== 'All' &&
        ticket.importance !== selectedImportance.value
      )
        return false

      // Date Range Filter
      if (
        fromDate.value &&
        new Date(ticket.created_at) < new Date(fromDate.value)
      )
        return false
      if (toDate.value && new Date(ticket.created_at) > new Date(toDate.value))
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
      return !filter.value || ticket.user.uuid?.includes(filter.value)
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

const status = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'OPEN':
      return 'success'
    case 'CLOSED':
      return 'danger'
    case 'REPLIED':
      return 'info'
    default:
      return 'info'
  }
}

const importance = (importance: string) => {
  switch (importance) {
    case 'LOW':
      return 'info'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
      return 'danger'
    default:
      return 'info'
  }
}

// Filter variables
const filters = ref(false)
const selectedStatus = ref('')
const selectedImportance = ref('')
const fromDate = ref('')
const toDate = ref('')

const supportStatus = ['All', 'PENDING', 'OPEN', 'REPLIED', 'CLOSED']
const supportImportance = ['All', 'LOW', 'MEDIUM', 'HIGH']

const numberOfFiltersToShow = computed(() => {
  let filtersCount = 2
  if (statusParam.value) filtersCount--
  if (importanceParam.value) filtersCount--
  return filtersCount
})

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDeleteModal(item: any) {
  supportStore.currentTicket = item
  isDeleteOpen.value = true
}

async function deleteItem() {
  isDeleting.value = true
  try {
    const response = await deleteTicket(supportStore.currentTicket?.uuid)
    supportStore.tickets = supportStore.tickets.filter(
      (ticket) => ticket.uuid !== supportStore.currentTicket?.uuid,
    )
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
  isDeleteOpen.value = false
  isDeleting.value = false
  supportStore.currentTicket = null
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <div class="w-full flex gap-2 xs:flex-col sm:flex-row">
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
            placeholder="Search Ticket ID..."
          />
          <BaseButton @click="filters = !filters" color="muted" block>
            <Icon v-if="filters" name="line-md:arrow-up" class="h-4 w-4 mr-2" />
            <Icon v-else name="line-md:arrow-down" class="h-4 w-4 mr-2" />
            {{ $t('Filters') }}
          </BaseButton>
        </div>
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
            <!-- Status Dropdown -->
            <BaseListbox
              v-if="!statusParam"
              v-model="selectedStatus"
              label="Status"
              :items="supportStatus"
              placeholder="Select status"
            />

            <!-- Importance Dropdown -->
            <BaseListbox
              v-if="!importanceParam"
              v-model="selectedImportance"
              label="Importance"
              :items="supportImportance"
              placeholder="Select ticket importance"
            />

            <!-- Date Range Inputs -->
            <BaseInput v-model="fromDate" type="date" label="From" />
            <BaseInput v-model="toDate" type="date" label="To" />
          </BaseCard>
        </TransitionGroup>
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
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableStart
                    label="User"
                    :hide-label="index > 0"
                    :logo="item.user?.avatar"
                    :title="item.subject"
                    :subtitle="`${item.user?.first_name} ${item.user?.last_name}`"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Importance"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      :color="importance(item.importance)"
                      flavor="pastel"
                      condensed
                      >{{ item.importance }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Status"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    <BaseTag
                      :color="status(item.status)"
                      flavor="pastel"
                      condensed
                      >{{ item.status }}</BaseTag
                    >
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-20 xs:justify-end xs:w-full"
                  >
                    <BaseDropdown
                      flavor="context"
                      label="Dropdown"
                      orientation="end"
                    >
                      <BaseDropdownItem
                        :to="`/admin/support/tickets/${item.uuid}`"
                        title="View Ticket"
                      >
                        <template #start>
                          <Icon
                            name="ph:eye-duotone"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>

                      <BaseDropdownItem
                        @click="openDeleteModal(item)"
                        title="Delete Ticket"
                      >
                        <template #start>
                          <Icon
                            name="line-md:close"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>
                    </BaseDropdown>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
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
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Ticket') }}
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
            {{ $t('Do you really want to delete this') }} {{ $t('ticket') }}
            {{ $t('This process cannot be undone') }}.
            {{
              $t(
                'This will also delete all the posts associated with this ticket',
              )
            }}.
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
              @click="deleteItem()"
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
