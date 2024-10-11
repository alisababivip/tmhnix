<script setup lang="ts">
import { useIcoTokenStore } from '~~/store/extensions/ico/user/tokens'
definePageMeta({
  title: 'Initial Coin Offering',
})

const route = useRoute()
const { uuid } = route.params
const icoTokenStore = useIcoTokenStore()
let intervalId
onMounted(async () => {
  if (icoTokenStore.tokens.length === 0) {
    await icoTokenStore.fetchIcoTokens()
  }
  intervalId = setInterval(() => {
    paginatedItems.value.forEach(updateCountdowns)
  }, 1000)
})

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  icoTokenStore.tokens.filter((item) => item.currency.includes(filter.value)),
)
const countdowns = reactive(new Map())

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end).map((item) => {
    const activePhase = item.phases?.find((phase) => phase.status === 'ACTIVE')
    const countdown = countdowns.get(item.id)
    return {
      ...item,
      activePhase,
      countdown,
    }
  })
})

const updateCountdowns = (item) => {
  const activePhase = item.phases?.find((phase) => phase.status === 'ACTIVE')
  if (activePhase) {
    const now = new Date()
    const start = new Date(activePhase.start_date)
    const end = new Date(activePhase.end_date)
    const isStarted = now >= start
    const targetDate = isStarted ? end : start
    let timeRemaining = targetDate.getTime() - now.getTime()

    // Ensure time remaining does not go below zero
    if (timeRemaining < 0) {
      timeRemaining = 0
    }

    let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    let hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    )
    let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    countdowns.set(item.id, { days, hours, minutes, seconds, isStarted })
  }
}

onUnmounted(() => {
  clearInterval(intervalId)
})
watchEffect(() => {
  items.value.forEach(updateCountdowns)
})
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter offers..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
        <BaseSelect
          v-model="perPage"
          placeholder="Items per page"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </BaseSelect>
      </template>
      <template #right>
        <BaseButton type="button" color="muted" :to="`/user/ico`">
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div>
        <div v-if="paginatedItems.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-6.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-6-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else>
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard v-for="item in paginatedItems" :key="item.id">
              <div
                class="border-muted-200 dark:border-muted-700 flex flex-col items-center border-b p-6 sm:flex-row"
              >
                <div class="flex flex-col items-center gap-3 sm:flex-row">
                  <BaseAvatar
                    :src="item.image"
                    :badge-src="`/img/crypto/${item.chain}.png`"
                    :text="item.currency"
                    size="xl"
                    class="bg-muted-500/20 text-muted-500"
                  />
                  <div class="text-center leading-none sm:text-left">
                    <h4
                      class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
                    >
                      {{ item.currency }} ({{ item.name }})
                    </h4>
                    <p class="text-muted-400 font-sans text-sm">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
                <div class="mt-4 flex items-center gap-3 sm:ms-auto sm:mt-0">
                  <div
                    class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                  >
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BaseHeading
                        tag="h3"
                        size="md"
                        weight="semibold"
                        class="text-muted-800 dark:text-muted-100"
                      >
                        <span>{{ item.activePhase?.name }}</span>
                      </BaseHeading>
                      <BaseParagraph
                        lead="none"
                        weight="semibold"
                        class="text-muted-400 !text-[0.65rem] uppercase"
                      >
                        <span>Phase</span>
                      </BaseParagraph>
                    </div>
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BaseHeading
                        tag="h3"
                        size="md"
                        weight="semibold"
                        class="text-muted-800 dark:text-muted-100"
                      >
                        <span>{{
                          (((item.activePhase?.allocations[0]?.percentage *
                            item.allocation?.percentage) /
                            100) *
                            item.total_supply) /
                          100
                        }}</span>
                      </BaseHeading>
                      <BaseParagraph
                        lead="none"
                        weight="semibold"
                        class="text-muted-400 !text-[0.65rem] uppercase"
                      >
                        <span>Sale Amount</span>
                      </BaseParagraph>
                    </div>
                    <div class="flex flex-col gap-1 px-4 text-center">
                      <BaseHeading
                        tag="h3"
                        size="md"
                        weight="semibold"
                        class="text-muted-800 dark:text-muted-100"
                      >
                        <span>{{ item.activePhase?.contributions ?? 0 }}</span>
                      </BaseHeading>
                      <BaseParagraph
                        lead="none"
                        weight="semibold"
                        class="text-muted-400 !text-[0.65rem] uppercase"
                      >
                        <span>Contributions</span>
                      </BaseParagraph>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex flex-col items-center justify-between px-6 py-4 sm:flex-row"
              >
                <div class="w-full grow space-y-1 sm:w-auto sm:max-w-[260px]">
                  <div class="flex items-center justify-between">
                    <h4
                      class="text-muted-700 dark:text-muted-100 font-sans text-sm font-medium"
                    >
                      Progress
                    </h4>
                    <div>
                      <span class="text-muted-400 font-sans text-sm">
                        {{ item.activePhase?.contributionPercentage ?? 0 }}%
                      </span>
                    </div>
                  </div>
                  <BaseProgress
                    size="xs"
                    color="primary"
                    :value="item.activePhase?.contributionPercentage ?? 0"
                  />
                </div>
                <div class="mt-4 w-full sm:mt-0 sm:w-auto">
                  <div v-if="item.countdown?.isStarted">
                    <span
                      >Ends in: {{ item.countdown?.days }}d
                      {{ item.countdown?.hours }}h
                      {{ item.countdown?.minutes }}m
                      {{ item.countdown?.seconds }}s</span
                    >
                  </div>
                  <div v-else-if="countdowns.has(item.id)">
                    <span
                      >Starts in: {{ item.countdown?.days }}d
                      {{ item.countdown?.hours }}h
                      {{ item.countdown?.minutes }}m
                      {{ item.countdown?.seconds }}s</span
                    >
                  </div>
                  <div v-else>Sale has ended</div>
                </div>
                <div class="mt-4 w-full sm:mt-0 sm:w-auto">
                  <NuxtLink :to="`/user/ico/${uuid}/offer/${item.id}`">
                    <BaseButton class="w-full sm:w-auto" color="primary">
                      View Offering
                    </BaseButton>
                  </NuxtLink>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
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
