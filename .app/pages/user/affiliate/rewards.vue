<script setup lang="ts">
definePageMeta({
  title: 'My Rewards',
})

const route = useRoute()
const { getRewards, claimReward } = useMlm()

const loading = ref(false)
const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const router = useRouter()
const oldFilter = ref('')
let rewards = ref([])

onMounted(async () => {
  loading.value = true

  try {
    const response = await getRewards()

    rewards.value = response.data.result
  } catch (error) {
    rewards.value = []
  }

  loading.value = false
})

const items = computed(() =>
  rewards.value
    .filter((reward) => {
      // Date Range Filter
      if (
        fromDate.value &&
        new Date(reward.created_at) < new Date(fromDate.value)
      )
        return false
      if (toDate.value && new Date(reward.created_at) > new Date(toDate.value))
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
      return !filter.value || reward.id?.includes(filter.value)
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

const filters = ref(false)
const fromDate = ref('')
const toDate = ref('')

const isClaimOpen = ref(false)
const claimId = ref('')
const isSubmitting = ref(false)

const openClaimModel = (id: string) => {
  claimId.value = id
  isClaimOpen.value = true
}

const closeModal = () => {
  isClaimOpen.value = false
}

const claim = async () => {
  isSubmitting.value = true

  try {
    await claimReward(claimId.value)
    isClaimOpen.value = false
    rewards.value = rewards.value.map((reward) => {
      if (reward.id === claimId.value) {
        reward.is_claimed = true
      }
      return reward
    })
  } catch (error) {
    console.log(error)
  }

  isSubmitting.value = false
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
            placeholder="Search Reward ID..."
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
            class="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 mb-6 p-5"
            v-if="filters"
          >
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
                    label="Reward"
                    :hide-label="index > 0"
                    :title="item.condition?.title"
                    :subtitle="formatDate(item.created_at)"
                  />
                </template>
                <template #end>
                  <TableFlexTableCell
                    label="Amount"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 xs:flex sm:hidden lg:flex"
                  >
                    {{ item.reward }} {{ item.condition?.reward_currency }}
                  </TableFlexTableCell>
                  <TableFlexTableCell label="Status" :hide-label="index > 0">
                    <BaseTag
                      :color="item.is_claimed ? 'success' : 'warning'"
                      flavor="pastel"
                      condensed
                      >{{ item.is_claimed ? 'Claimed' : 'Pending' }}
                    </BaseTag>
                  </TableFlexTableCell>
                  <TableFlexTableCell
                    label="Actions"
                    :hide-label="index > 0"
                    class="w-full sm:w-24 xs:flex sm:hidden lg:flex"
                  >
                    <BaseButtonIcon
                      v-if="!item.is_claimed"
                      color="success"
                      size="sm"
                      @click="openClaimModel(item.id)"
                      data-nui-tooltip="Claim Reward"
                    >
                      <Icon name="line-md:confirm" class="h-4 w-4" />
                    </BaseButtonIcon>
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

    <TairoModal :open="isClaimOpen" size="lg" @close="closeModal">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Claim Reward') }}
          </h3>
          <BaseButtonClose @click="isClaimOpen = false" />
        </div>
      </template>
      <div class="px-4 md:px-6 space-y-5">
        Are you sure you want to claim this reward?
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isClaimOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="claim()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Claim') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
