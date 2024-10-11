<script setup lang="ts">
import { useStakingLogsStore } from '~~/store/extensions/staking/user/logs'
definePageMeta({
  title: 'Staking Logs',
})

const stakingLogStore = useStakingLogsStore()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  stakingLogStore.logs.filter(
    (item) =>
      item.uuid.includes(filter.value) ||
      item.pool?.currency.includes(filter.value),
  ),
)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (stakingLogStore.logs.length === 0) {
    stakingLogStore.loading = true
    await stakingLogStore.fetchStakingLogs()
    stakingLogStore.loading = false
  }
})

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'warning'
    case 'RELEASED':
      return 'info'
    case 'WITHDRAWN':
      return 'success'
  }
}

// Delete modal
const isCollectOpen = ref(false)
const isSubmitting = ref(false)
const selectedItem = ref(null)
const { toast } = useUtils()
const { withdrawStake } = useStaking()

function openCollectModel(item: any) {
  selectedItem.value = item
  isCollectOpen.value = true
}

async function collectStake() {
  isSubmitting.value = true
  try {
    const response = (await withdrawStake(selectedItem.value?.id)) as any
    toast.response(response)
    if (response.status === 'success') {
      await stakingLogStore.fetchStakingLogs()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCollectOpen.value = false
  isSubmitting.value = false
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
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter stakes..."
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
          v-if="!stakingLogStore.loading && paginatedItems?.length === 0"
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
                  label="Stake"
                  :hide-label="index > 0"
                  :logo="`/img/crypto/${item.pool?.currency.toLowerCase()}.png`"
                  :title="`${item.pool?.currency} (${item.pool?.name})`"
                  :subtitle="item.uuid"
                />
              </template>
              <template #end>
                <TableFlexTableStart
                  label="Duration"
                  :hide-label="index > 0"
                  :title="`Start: ${formatDate(item.stake_date)}`"
                  :subtitle="`End: ${formatDate(item.release_date)}`"
                />
                <TableFlexTableCell
                  label="Amount"
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
                <TableFlexTableCell label="Action" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      v-show="
                        item.status === 'RELEASED' || item.status === 'ACTIVE'
                      "
                      :disabled="item.status !== 'RELEASED'"
                      @click="
                        item.status === 'RELEASED'
                          ? openCollectModel(item)
                          : null
                      "
                      title="Collect Rewards"
                    >
                      <template #start>
                        <Icon
                          name="solar:card-recive-bold-duotone"
                          class="me-2 block h-5 w-5"
                          :class="{
                            'text-gray-400': item.status !== 'RELEASED',
                          }"
                        />
                      </template>
                      {{
                        item.status === 'RELEASED'
                          ? 'Collect Rewards'
                          : 'Locked'
                      }}
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

    <TairoModal :open="isCollectOpen" size="sm" @close="isCollectOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Collect') }} {{ $t('Staking Reward') }}
          </h3>
          <BaseButtonClose @click="isCollectOpen = false" />
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
            {{ $t('Do you really want to collect this') }}
            {{ $t('stake reward') }}? {{ $t('This process cannot be undone') }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCollectOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="success"
              flavor="solid"
              @click="collectStake()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Collect') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
