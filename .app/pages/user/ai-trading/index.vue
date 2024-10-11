<script setup lang="ts">
import { VeProgress } from 'vue-ellipse-progress'
import { useAiTradingInvestmentStore } from '~~/store/extensions/ai-trading/investment'
definePageMeta({
  title: 'AI Trading Assistant',
})
const aiTradingInvestmentStore = useAiTradingInvestmentStore()
const investments = computed(() => aiTradingInvestmentStore.activeInvestments)

// Initialize an object to hold timer data for each investment
const timerData = reactive({})

const progressSize = ref(300)
const progressThickness = ref(46)

const setSize = () => {
  if (window.innerWidth <= 768) {
    progressSize.value = 200
    progressThickness.value = 30
  } else if (window.innerWidth <= 1200) {
    progressSize.value = 250
    progressThickness.value = 38
  } else {
    progressSize.value = 300
    progressThickness.value = 46
  }
}
onMounted(async () => {
  if (aiTradingInvestmentStore.investments.length === 0) {
    await aiTradingInvestmentStore.fetchActiveInvestments()
  }
  await initializeMarkets()
  // Initial set
  setSize()
  // Update size on window resize
  window.addEventListener('resize', setSize)

  initializeTimers()
})

// Cleanup
onBeforeUnmount(() => {
  window.removeEventListener('resize', setSize)
})

const marketStore = useMarketStore()
const initializeMarkets = async () => {
  if (marketStore.markets.length === 0) {
    await marketStore.fetchMarkets()
  }
}
const firstMarket = computed(() => marketStore.markets[0])

const status = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'ACTIVE':
      return 'Active'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'REJECTED':
      return 'Rejected'
    default:
      return 'Unknown'
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    default:
      return 'gray'
  }
}

const generateRadialColors = (baseColor: string) => ({
  radial: true,
  colors: [
    { color: baseColor, offset: '50', opacity: '0.15' },
    { color: baseColor, offset: '70', opacity: '0.15' },
    { color: baseColor, offset: '70', opacity: '0.1' },
    { color: baseColor, offset: '90', opacity: '1' },
    { color: baseColor, offset: '60', opacity: '1' },
    { color: baseColor, offset: '0', opacity: '0' },
  ],
})

const generateRadialFillColors = (baseColor: string) => ({
  radial: true,
  colors: [
    { color: baseColor, offset: '50', opacity: '0.2' },
    { color: baseColor, offset: '50', opacity: '0.15' },
    { color: baseColor, offset: '70', opacity: '0.15' },
    { color: baseColor, offset: '70', opacity: '0.1' },
    { color: baseColor, offset: '90', opacity: '0.1' },
    { color: 'transparent', offset: '90', opacity: '0.1' },
    { color: 'transparent', offset: '95', opacity: '0.1' },
    { color: 'transparent', offset: '95', opacity: '0.1' },
  ],
})

const data = {
  emptyColor: generateRadialColors('#3260FC'),
  emptyColorFill: generateRadialFillColors('#3260FC'),
  greenColor: generateRadialColors('#00FF00'),
  greenColorFill: generateRadialFillColors('#00FF00'),
  redColor: generateRadialColors('#FF0000'),
  redColorFill: generateRadialFillColors('#FF0000'),
}

const convertSecondsToTime = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

const initializeTimers = () => {
  investments.value.forEach((investment) => {
    if (investment.status === 'ACTIVE') {
      // Calculate total seconds based on the duration and timeframe
      let totalSeconds
      switch (investment.duration.timeframe) {
        case 'HOUR':
          totalSeconds = investment.duration.duration * 3600
          break
        case 'DAY':
          totalSeconds = investment.duration.duration * 86400
          break
        case 'WEEK':
          totalSeconds = investment.duration.duration * 604800 // 7 days in a week
          break
        case 'MONTH':
          totalSeconds = investment.duration.duration * 2592000 // Assuming 30 days in a month
          break
        // Add more cases as necessary
        default:
          totalSeconds = 0 // Default or error handling
      }

      const currentTime = new Date().getTime()
      const createdTime = new Date(investment.created_at).getTime()
      const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000)
      const remainingSeconds = totalSeconds - elapsedSeconds

      timerData[investment.id] = {
        remainingSeconds,
        percentage: (remainingSeconds / totalSeconds) * 100,
        completed: remainingSeconds <= 0,
      }
    }
  })

  setInterval(() => {
    updateTimers()
  }, 1000)
}

const { getAITrading } = useAiTrading()

const updateTimers = () => {
  if (!investments.value) {
    return // exit if investments.value is not available
  }
  investments.value.forEach(async (investment) => {
    if (!investment || !timerData[investment.id]) {
      return
    }
    if (investment.status === 'ACTIVE' && timerData[investment.id]) {
      if (timerData[investment.id].remainingSeconds > 0) {
        timerData[investment.id].remainingSeconds -= 1
        timerData[investment.id].percentage =
          (timerData[investment.id].remainingSeconds /
            (investment.duration.duration *
              (investment.duration.timeframe === 'HOUR' ? 3600 : 86400))) *
          100

        const timeObj = convertSecondsToTime(
          timerData[investment.id].remainingSeconds,
        )
        timerData[investment.id].timeDisplay =
          `${timeObj.days} : ${timeObj.hours} : ${timeObj.minutes} : ${timeObj.seconds}`
      } else {
        timerData[investment.id].completed = true
        timerData[investment.id].percentage = 100
        timerData[investment.id].timeDisplay = 'Completed! 🎉'
        const response = await getAITrading(investment.uuid)
        if (response.status === 'success') {
          if (response.data.result.status !== 'ACTIVE') {
            await aiTradingInvestmentStore.fetchActiveInvestments()
          }
        }
      }
    }
  })
}

const perPage = ref(6)
const route = useRoute()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return investments.value.slice(start, end)
})
</script>

<template>
  <div class="px-5">
    <TairoContentWrapper>
      <div
        class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full"
      >
        <div
          class="relative w-[320px]"
          :class="{
            'h-[170px]': $viewport.isLessThan('sm'),
            'h-[175px]': $viewport.isGreaterOrEquals('sm'),
          }"
        >
          <LottieAi
            classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-12"
            height="320px"
          />
        </div>
        <div class="mt-24 grow sm:mt-0">
          <div
            class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-2xl"
          >
            <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
              <span>
                {{ $t('Boost Your Earnings With AI Assisted Trading') }}!
                <span class="text-3xl">📈</span>
              </span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-white opacity-70">
              <span>
                {{
                  $t(
                    'Optimize your trading strategies with our advanced AI trading plans. Start now and gain a competitive edge!',
                  )
                }}
              </span>
            </BaseParagraph>
            <div class="mt-2">
              <BaseButton
                size="sm"
                color="light"
                flavor="outline"
                class="w-full sm:w-auto"
                :to="`/ai-trading/${firstMarket?.symbol}`"
              >
                <span>{{ $t('Explore Plans') }}</span>
                <Icon name="lucide:arrow-right" class="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <template v-if="investments.length === 0">
        <div
          class="flex w-full items-center justify-center"
          :class="{
            'mt-10': $viewport.isGreaterThan('sm'),
            'min-h-[320px]': $viewport.isLessThan('sm'),
            'min-h-[400px]': $viewport.isGreaterOrEquals('sm'),
          }"
        >
          <div class="mx-auto w-full flex items-center text-center relative">
            <div class="mx-auto w-full px-10">
              <BaseHeading
                as="h4"
                weight="medium"
                size="xl"
                class="text-muted-800 mb-1 dark:text-white"
              >
                {{ $t('Unlock Your AI Earning Potential') }}
              </BaseHeading>
              <p class="text-muted-400 font-sans text-sm">
                {{
                  $t(
                    'You have not invested in any AI trading plans yet. Start investing now and unlock your earning potential!',
                  )
                }}.
              </p>

              <div
                class="mt-2 flex justify-center gap-2"
                v-if="firstMarket?.symbol"
              >
                <NuxtLink :to="`/ai-trading/${firstMarket?.symbol}`">
                  <BaseButton color="primary" shape="rounded">
                    <span>{{ $t('Start Investing') }}</span>
                  </BaseButton>
                </NuxtLink>
              </div>
            </div>

            <LottieBlockchain3
              v-if="$viewport.isGreaterThan('sm')"
              classes="max-w-3xl mx-auto"
              height="400px"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="mt-16">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <NuxtLink
              v-for="(item, index) in paginatedItems"
              :key="index"
              :to="`/ai-trading/${item.market}`"
            >
              <BaseCard
                class="p-5 w-full space-y-3 shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
              >
                <div class="flex justify-between items-center">
                  <span>#{{ item.id }}</span>
                  <BaseTag :color="statusClass(item.status)" condensed>{{
                    status(item.status)
                  }}</BaseTag>
                </div>
                <div class="flex justify-center">
                  <VeProgress
                    :size="progressSize"
                    :dot="{
                      size: progressThickness,
                      backgroundColor: 'white',
                      width: '2px',
                    }"
                    id="timer-example"
                    :progress="
                      timerData[item.id]?.completed ||
                      item.status === 'COMPLETED' ||
                      item.status === 'CANCELLED'
                        ? 0
                        : timerData[item.id]?.percentage
                    "
                    line="butt"
                    :color="
                      item.status === 'COMPLETED'
                        ? data.greenColor
                        : item.status === 'CANCELLED'
                          ? data.redColor
                          : timerData[item.id]?.completed
                            ? data.emptyColor
                            : data.emptyColor
                    "
                    :emptyColorFill="
                      item.status === 'COMPLETED'
                        ? data.greenColorFill
                        : item.status === 'CANCELLED'
                          ? data.redColorFill
                          : timerData[item.id]?.completed
                            ? data.greenColorFill
                            : data.emptyColorFill
                    "
                    empty-color="#324c7e"
                    :thickness="progressThickness"
                    emptyThickness="8"
                    dash="strict 60 0.9"
                    lineMode="in -8"
                    legend="0"
                    legendClass="legend-custom-style"
                    fontSize="1rem"
                    font-color="white"
                    animation="loop 1000 100"
                  >
                    <div v-if="item.status === 'COMPLETED'" class="text-center">
                      <span
                        :class="{
                          'text-success-500': item.result === 'WIN',
                          'text-danger-500': item.result === 'LOSS',
                          'text-gray-500': item.result === 'DRAW',
                        }"
                        class="font-bold"
                      >
                        {{ item.profit.toFixed(2) }}
                        {{ item.market.split('/')[1] }}
                      </span>
                      <br />
                      <span
                        :class="{
                          'text-success-500': item.profit > 0,
                          'text-danger-500': item.profit < 0,
                          'text-gray-500': item.profit === 0,
                        }"
                      >
                        {{ ((item.profit / item.amount) * 100).toFixed(2) }}%
                      </span>
                    </div>
                    <span
                      v-else-if="item.status === 'CANCELLED'"
                      slot="legend-caption"
                      class="text-lg font-bold text-danger-500"
                      >{{ $t('Canceled') }}</span
                    >
                    <span
                      v-else-if="item.status === 'ACTIVE'"
                      slot="legend-caption"
                      class="text-gray-900 dark:text-gray-100"
                    >
                      {{ timerData[item.id]?.timeDisplay }}
                    </span>
                  </VeProgress>
                </div>
                <div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-bold text-gray-700 dark:text-gray-300"
                      >Plan</span
                    >
                    <span>{{ item.plan.title }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-bold text-gray-700 dark:text-gray-300"
                      >Market</span
                    >
                    <span>{{ item.market }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-bold text-gray-700 dark:text-gray-300"
                      >Amount</span
                    >
                    <span
                      >{{ item.amount }} {{ item.market?.split('/')[1] }}</span
                    >
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-bold text-gray-700 dark:text-gray-300"
                      >Duration</span
                    >
                    <span>{{
                      item.duration?.duration + ' ' + item.duration?.timeframe
                    }}</span>
                  </div>
                </div>
              </BaseCard>
            </NuxtLink>
          </div>
        </div>
        <div class="mt-6">
          <BasePagination
            v-if="investments.length > perPage"
            :total-items="investments.length"
            :current-page="page"
            :item-per-page="perPage"
            shape="curved"
          />
        </div>
      </template>
    </TairoContentWrapper>
    <Faqs category="AI TRADING" />
  </div>
</template>
