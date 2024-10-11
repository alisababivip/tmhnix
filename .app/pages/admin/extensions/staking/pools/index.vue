<script setup lang="ts">
import { useAdminStakingPoolsStore } from '~~/store/extensions/staking/admin/pools'
import type { StakingPool } from '~~/types'
definePageMeta({
  permissions: ['View Staking Pools'],
  title: 'Staking Pools',
})

const stakingPoolStore = useAdminStakingPoolsStore()
const { deleteAdminStakingPool } = useStaking()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  stakingPoolStore.pools.filter(
    (item) => item.currency?.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (stakingPoolStore.pools.length === 0) {
    stakingPoolStore.loading = true
    await stakingPoolStore.fetchStakingPools()
    stakingPoolStore.loading = false
  }
})
const { toast } = useUtils()

const router = useRouter()

function selectPool(item: StakingPool) {
  stakingPoolStore.selectPool(item)
  router.push(`/admin/extensions/staking/pools/edit/${item.id}`)
}

// Delete modal
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const selectedItem = ref(null)

function openDeleteModal(item: any) {
  selectedItem.value = item
  isDeleteOpen.value = true
}

async function deletePool() {
  isDeleting.value = true
  try {
    const response = (await deleteAdminStakingPool(
      selectedItem.value?.id,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      stakingPoolStore.removePool(selectedItem.value?.id)
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
    case 'INACTIVE':
      return 'danger'
    case 'ACTIVE':
      return 'success'
    case 'COMPLETED':
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
          placeholder="Filter pools..."
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
          :to="`/admin/extensions/staking/pools/create`"
        >
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Create') }}</BaseButton
        >
      </template>
      <div>
        <template
          v-if="!stakingPoolStore.loading && paginatedItems?.length === 0"
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
                  label="Pool"
                  :hide-label="index > 0"
                  :title="`${item.name} (${item.currency})`"
                  :subtitle="item.chain"
                />
              </template>
              <template #end>
                <TableFlexTableStart
                  label="Limits"
                  :hide-label="index > 0"
                  :title="`Min: ${item.min_stake}`"
                  :subtitle="`Max: ${item.max_stake}`"
                />
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
                      @click="selectPool(item)"
                      title="Edit Pool"
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
                      title="Delete Pool"
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
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Delete') }} {{ $t('Staking Pool') }}
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
            {{ $t('Do you really want to delete this') }}
            {{ $t('pool') }}
            {{ $t('This process cannot be undone') }}.
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
              @click="deletePool()"
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
