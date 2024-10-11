<script setup lang="ts">
import type { User, BinaryOrder } from '~~/types'

definePageMeta({
  title: 'Binary Trading',
  layout: 'default',
})

const marketStore = useMarketStore()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const livePositions = computed(
  () => marketStore.getBinaryLivePositions as BinaryOrder[],
)

const PracticePositions = computed(
  () => marketStore.getBinaryPracticePositions as BinaryOrder[],
)

const LivePositionsTotalCount = computed(() => livePositions.value.length)

const LivePositionsMonthCount = computed(() =>
  livePositions.value.filter(
    (item) =>
      new Date(item.created_at).getTime() >
      new Date(new Date().setDate(new Date().getDate() - 30)).getTime(),
  ),
)

const LivePostionsLastMonthCount = computed(() =>
  livePositions.value.filter(
    (item) =>
      new Date(item.created_at).getTime() >
        new Date(new Date().setDate(new Date().getDate() - 60)).getTime() &&
      new Date(item.created_at).getTime() <
        new Date(new Date().setDate(new Date().getDate() - 30)).getTime(),
  ),
)

const LivePositionsMonthPercentage = computed(() =>
  LivePostionsLastMonthCount.value.length === 0
    ? 0
    : (
        (LivePositionsMonthCount.value.length /
          LivePostionsLastMonthCount.value.length) *
        100
      ).toFixed(2),
)

const PracticePositionsMonthCount = computed(() =>
  PracticePositions.value.filter(
    (item) =>
      new Date(item.created_at).getTime() >
      new Date(new Date().setDate(new Date().getDate() - 30)).getTime(),
  ),
)

const PracticePostionsLastMonthCount = computed(() =>
  PracticePositions.value.filter(
    (item) =>
      new Date(item.created_at).getTime() >
        new Date(new Date().setDate(new Date().getDate() - 60)).getTime() &&
      new Date(item.created_at).getTime() <
        new Date(new Date().setDate(new Date().getDate() - 30)).getTime(),
  ),
)

const PracticePositionsMonthPercentage = computed(() =>
  PracticePostionsLastMonthCount.value.length === 0
    ? 0
    : (
        (PracticePositionsMonthCount.value.length /
          PracticePostionsLastMonthCount.value.length) *
        100
      ).toFixed(2),
)

const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)

onMounted(async () => {
  await marketStore.fetchBinaryPositions()

  if (marketStore.markets.length === 0) {
    await marketStore.fetchMarkets()
  }
})

const firstAvailableMarket = computed(() => {
  return (
    (marketStore.markets &&
      marketStore.markets[0] &&
      marketStore.markets[0].symbol) ||
    null
  )
})
</script>

<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <div class="ltablet:col-span-6 col-span-12 sm:col-span-6 space-y-5">
        <BaseCard class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph
                size="md"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>{{ $t('Live Positions (30 days)') }}</span>
              </BaseParagraph>
              <div class="pb-6 pt-4">
                <span
                  class="text-muted-800 dark:text-muted-100 font-sans text-4xl font-semibold leading-none"
                >
                  <span class="mr-2">{{ LivePositionsMonthCount.length }}</span>
                  <small
                    class="text-muted-500 dark:text-muted-400 text-sm font-medium"
                  >
                    {{ $t('positions') }}
                  </small>
                </span>
              </div>
              <div class="mb-2 flex items-center gap-2 font-sans">
                <span
                  v-if="Number(LivePositionsMonthPercentage) === 0"
                  class="text-muted-400 text-sm"
                >
                  {{ $t('No records from last month') }}
                </span>
                <div v-else>
                  <div
                    class="flex items-center font-semibold"
                    :class="
                      Number(LivePositionsMonthPercentage) > 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    <Icon
                      :name="
                        Number(LivePositionsMonthPercentage) > 0
                          ? 'ri:arrow-up-s-fill'
                          : 'ri:arrow-down-s-fill'
                      "
                      class="h-4 w-4"
                    />
                    <span>
                      <span>{{ LivePositionsMonthPercentage }}</span
                      >%
                    </span>
                  </div>
                  <span class="text-muted-400 text-sm">
                    {{
                      Number(LivePositionsMonthPercentage) > 0 ? 'more' : 'less'
                    }}
                    {{ $t('than last month') }}
                  </span>
                </div>
              </div>
            </div>
            <span class="xs:hidden sm:block">
              <img
                src="/img/illustrations/widgets/5.svg"
                class="h-32 rounded-full transition duration-300 ease-in-out transform hover:-rotate-6 hover:scale-105"
              />
            </span>
          </div>
        </BaseCard>

        <BasePlaceholderPage
          :title="LivePositionsTotalCount === 0 ? 'No Live Positions' : ''"
          :subtitle="
            settings?.binary_trading_practice
              ? 'Practice your trading skills with a Practice account or start trading with a live account.'
              : 'Start trading with a live account.'
          "
        >
          <template #image>
            <LottieBinary />
          </template>

          <div
            class="mt-2 flex justify-center gap-2"
            v-if="firstAvailableMarket !== null"
          >
            <NuxtLink
              v-if="settings?.binary_trading_practice"
              :to="`/binary/${firstAvailableMarket}?isPractice=true`"
            >
              <BaseButton color="default" shape="curved" class="h-11 w-32">{{
                $t('Practice')
              }}</BaseButton>
            </NuxtLink>

            <NuxtLink :to="`/binary/${firstAvailableMarket}`">
              <BaseButton color="primary" shape="curved" class="h-11 w-32">{{
                $t('Start Trading')
              }}</BaseButton>
            </NuxtLink>
          </div>
          <div v-else class="mt-2">
            <BaseButton color="primary" shape="curved" class="h-11 w-32"
              >{{ $t('Coming Soon') }}
            </BaseButton>
          </div>
        </BasePlaceholderPage>
      </div>
      <div
        class="ltablet:col-span-6 col-span-12 sm:col-span-6 h-full space-y-5"
      >
        <BaseCard class="p-6" v-if="settings?.binary_trading_practice">
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph
                size="md"
                class="text-muted-500 dark:text-muted-400"
              >
                <span>{{ $t('Practice Positions (30 days)') }}</span>
              </BaseParagraph>
              <div class="pb-6 pt-4">
                <span
                  class="text-muted-800 dark:text-muted-100 font-sans text-4xl font-semibold leading-none"
                >
                  <span class="mr-2">{{
                    PracticePositionsMonthCount.length
                  }}</span>
                  <small
                    class="text-muted-500 dark:text-muted-400 text-sm font-medium"
                  >
                    {{ $t('positions') }}
                  </small>
                </span>
              </div>
              <div class="mb-2 flex items-center gap-2 font-sans">
                <span
                  v-if="Number(PracticePositionsMonthPercentage) === 0"
                  class="text-muted-400 text-sm"
                >
                  {{ $t('No records from last month') }}
                </span>
                <div v-else>
                  <div
                    class="flex items-center font-semibold"
                    :class="
                      Number(PracticePositionsMonthPercentage) > 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    <Icon
                      :name="
                        Number(PracticePositionsMonthPercentage) > 0
                          ? 'ri:arrow-up-s-fill'
                          : 'ri:arrow-down-s-fill'
                      "
                      class="h-4 w-4"
                    />
                    <span>
                      <span>{{ PracticePositionsMonthPercentage }}</span
                      >%
                    </span>
                  </div>
                  <span class="text-muted-400 text-sm">
                    {{
                      Number(PracticePositionsMonthPercentage) > 0
                        ? 'more'
                        : 'less'
                    }}
                    {{ $t('than last month') }}
                  </span>
                </div>
              </div>
            </div>
            <span class="xs:hidden sm:block">
              <img
                src="/img/illustrations/widgets/3.svg"
                class="h-32 rounded-full transition duration-300 ease-in-out transform hover:-rotate-6 hover:scale-105"
              />
            </span>
          </div>
        </BaseCard>
        <BaseCard shape="curved" class="p-6">
          <UserBinaryListTabbed
            shape="full"
            :live-positions="livePositions"
            :practice-positions="PracticePositions"
          />
        </BaseCard>
      </div>
    </div>
    <Faqs category="BINARY" />
  </div>
</template>
