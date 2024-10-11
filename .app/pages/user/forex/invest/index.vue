<script setup lang="ts">
import { useForexInvestmentStore } from '~~/store/extensions/forex/investment'
definePageMeta({
  title: 'Investment Dashboard',
})
const investmentStore = useForexInvestmentStore()
const planProfit = ref(0)
const investment = computed(() => investmentStore.investment)
const radialGrowth = reactive(useRadialGrowth())
const { cancelInvestment } = useForex()
const { toast } = useUtils()
const isLoading = ref(false)

onMounted(async () => {
  if (investmentStore.investment === null) {
    await investmentStore.fetchInvestment()
  }

  if (investment.value) {
    planProfit.value = calculateElapsed(investment.value)
  }
})

function calculateElapsed() {
  const currentDate = new Date()
  const investmentCreatedAt = new Date(investment.value?.created_at)
  const endDate = new Date(investment.value?.end_date)
  const timeframe = investment.value?.duration.timeframe

  let elapsed

  // Calculate the total duration depending on the timeframe
  switch (timeframe) {
    case 'HOUR':
      const totalHours =
        (endDate.getTime() - investmentCreatedAt.getTime()) / (1000 * 3600)
      const elapsedHours =
        (currentDate.getTime() - investmentCreatedAt.getTime()) / (1000 * 3600)
      elapsed = Math.round((elapsedHours / totalHours) * 100)
      break
    case 'DAY':
      const totalDays =
        (endDate.getTime() - investmentCreatedAt.getTime()) / (1000 * 3600 * 24)
      const elapsedDays =
        (currentDate.getTime() - investmentCreatedAt.getTime()) /
        (1000 * 3600 * 24)
      elapsed = Math.round((elapsedDays / totalDays) * 100)
      break
    case 'WEEK':
      const totalWeeks =
        (endDate.getTime() - investmentCreatedAt.getTime()) /
        (1000 * 3600 * 24 * 7)
      const elapsedWeeks =
        (currentDate.getTime() - investmentCreatedAt.getTime()) /
        (1000 * 3600 * 24 * 7)
      elapsed = Math.round((elapsedWeeks / totalWeeks) * 100)
      break
    case 'MONTH':
      const totalMonths =
        (endDate.getTime() - investmentCreatedAt.getTime()) /
        (1000 * 3600 * 24 * 30)
      const elapsedMonths =
        (currentDate.getTime() - investmentCreatedAt.getTime()) /
        (1000 * 3600 * 24 * 30)
      elapsed = Math.round((elapsedMonths / totalMonths) * 100)
      break
    default:
      throw new Error('Invalid timeframe')
  }
  return elapsed // This will give you the elapsed time in percentage
}

const endDateInDays = computed(() => {
  if (investment.value === null) return null

  const currentDate = new Date()
  const endDate = new Date(investment.value?.end_date)

  const timeDiff = endDate.getTime() - currentDate.getTime()

  if (timeDiff <= 0) return 'Plan ended'

  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
  const hourDiff = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600))
  const minDiff = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60))
  const secDiff = Math.floor((timeDiff % (1000 * 60)) / 1000)

  if (dayDiff > 0) {
    return `in ${dayDiff} days`
  } else if (hourDiff > 0) {
    return `in ${hourDiff} hours`
  } else if (minDiff > 0) {
    return `in ${minDiff} minutes`
  } else {
    return `in ${secDiff} seconds`
  }
})

watch(planProfit, (newProfit) => {
  radialGrowth.series = [newProfit]
})

function useRadialGrowth() {
  const { success } = useTailwindColors()
  const height = 240
  const type = 'radialBar'

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [success.value],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '75%',
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '0.7rem',
            fontWeight: 400,
            offsetY: -10,
          },
          value: {
            show: true,
            fontWeight: 600,
            fontSize: '16px',
            offsetY: -5,
          },
        },
      },
    },
    labels: ['Progress'],
  }

  return {
    type,
    height,
    options,
    series: [planProfit.value],
  }
}

async function cancel() {
  try {
    isLoading.value = true
    const response = await cancelInvestment(investment.value?.uuid as string)
    toast.response(response)
    if (response.status === 'success') {
      await investmentStore.fetchInvestment()
      isCancelOpen.value = false
    }
  } catch (error) {
    toast.danger(error as any)
  } finally {
    isLoading.value = false
  }
}

const isCancelOpen = ref(false)
</script>

<template>
  <div class="space-y-5">
    <div
      class="mb-8 flex flex-col justify-between md:flex-row md:items-center"
      v-if="investment !== null"
    >
      <div
        class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
      >
        <BaseAvatar src="/img/illustrations/wizard/finish.svg" size="xl" />
        <div>
          <BaseHeading
            as="h2"
            size="xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ $t('Your Investment Plan is Active') }}</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              {{
                $t(
                  'Your investment plan is currently active. You can cancel your plan at any time',
                )
              }}.
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div
        class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
      >
        <NuxtLink to="/user/forex">
          <BaseButton type="submit" color="muted"
            ><Icon
              name="line-md:arrow-small-left"
              class="h-5 w-5 text-current mr-2"
            />
            {{ $t('Back') }}
          </BaseButton></NuxtLink
        >
      </div>
    </div>
    <div
      class="flex flex-col md:flex-row gap-5 pb-20"
      v-if="investment !== null"
    >
      <div class="flex-1 h-full">
        <BaseCard shape="rounded" class="min-w-sm">
          <div class="flex gap-12">
            <img
              :src="investment?.plan?.image || '/img/placeholder.png'"
              loading="lazy"
              format="avif"
              class="w-full mb-4 rounded-t-lg h-40 object-cover"
            />
          </div>
          <div class="space-y-4">
            <div class="px-5">
              <div>
                <BaseParagraph size="xl" class="text-success-500">
                  {{ $t('Active Plan') }}:
                  {{ investment?.plan?.title }}
                </BaseParagraph>
              </div>
            </div>

            <div class="font-sans text-xs px-5">
              <ul>
                <li class="flex items-center gap-2 text-success-500">
                  <Icon
                    name="fluent:chevron-right-12-filled"
                    class="h-3 w-3 text-current"
                  />
                  <span class="text-muted-400"
                    >{{ $t('Invested Amount') }}:
                    <span class="text-gray-800 dark:text-gray-200">{{
                      investment?.amount
                    }}</span></span
                  >
                </li>
                <li class="flex items-center gap-2 text-success-500">
                  <Icon
                    name="fluent:chevron-right-12-filled"
                    class="h-3 w-3 text-current"
                  />
                  <span class="text-muted-400"
                    >{{ $t('Profit') }}:
                    <span class="text-gray-800 dark:text-gray-200">{{
                      investment?.plan?.profit_percentage > 0
                        ? investment?.amount *
                          (investment?.plan?.profit_percentage / 100)
                        : 'Pending'
                    }}</span></span
                  >
                </li>
                <li class="flex items-center gap-2 text-success-500">
                  <Icon
                    name="fluent:chevron-right-12-filled"
                    class="h-3 w-3 text-current"
                  />
                  <span class="text-muted-400"
                    >{{ $t('Return of Investment') }}:
                    <span class="text-gray-800 dark:text-gray-200">{{
                      investment?.plan?.profit_percentage > 0
                        ? investment?.plan?.profit_percentage + '%'
                        : 'Pending'
                    }}</span></span
                  >
                </li>
              </ul>
            </div>
            <div class="px-5 pb-5">
              <BaseButton
                color="danger"
                shape="rounded"
                class="w-full"
                :disabled="isLoading"
                :loading="isLoading"
                @click="isCancelOpen = true"
              >
                <span> {{ $t('Cancel Plan') }} </span>
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
      <BaseCard class="flex h-full flex-col p-5 relative flex-1">
        <div class="mb-5 flex items-center justify-between">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ $t('Investment Progress') }}</span>
          </BaseHeading>
        </div>
        <div class="">
          <AddonApexcharts v-bind="radialGrowth" />
        </div>

        <div class="font-sans text-xs px-5">
          <ul>
            <li class="flex items-center gap-2 text-success-500">
              <Icon
                name="fluent:chevron-right-12-filled"
                class="h-3 w-3 text-current"
              />
              <span class="text-muted-400"
                >{{ $t('Started on') }}:
                <span class="text-gray-800 dark:text-gray-200">
                  {{ formatDate(investment?.created_at) }}</span
                ></span
              >
            </li>
            <li class="flex items-center gap-2 text-success-500">
              <Icon
                name="fluent:chevron-right-12-filled"
                class="h-3 w-3 text-current"
              />
              <span class="text-muted-400"
                >{{ $t('Ends') }}
                <span class="text-gray-800 dark:text-gray-200">{{
                  endDateInDays
                }}</span></span
              >
            </li>
          </ul>
        </div>
      </BaseCard>
    </div>

    <div v-else class="flex min-h-[80vh] items-center justify-center">
      <div class="mx-auto w-full text-center">
        <LottieBlockchain2 height="400px" />

        <div class="mx-auto max-w-sm">
          <BaseHeading
            as="h4"
            weight="medium"
            size="xl"
            class="text-muted-800 mb-1 mt-4 dark:text-white"
          >
            {{ $t('Unlock Your Forex Earning Potential') }}!
          </BaseHeading>
          <p class="text-muted-400 font-sans text-sm">
            {{
              $t(
                "It looks like you're missing out on incredible earning opportunities. Click below to leap into a world of smart, secure, and profitable investments",
              )
            }}.
          </p>

          <div class="mt-2 flex justify-center gap-2">
            <NuxtLink to="/user/forex/invest/new">
              <BaseButton color="primary" shape="rounded">
                <span>{{ $t('Start Investing') }}</span>
              </BaseButton>
            </NuxtLink>
            <NuxtLink to="/user/forex">
              <BaseButton color="muted" shape="rounded">
                <span>{{ $t('Go Back') }}</span>
              </BaseButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <TairoModal :open="isCancelOpen" size="sm" @close="isCancelOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Cancel Investment Plan') }}
          </h3>
          <BaseButtonClose @click="isCancelOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure') }}?
          </h3>
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{
              $t(
                'Do you really want to cancel your investment plan? This process cannot be undone',
              )
            }}.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="danger"
              flavor="solid"
              @click="cancel"
              :disabled="isLoading"
              :loading="isLoading"
            >
              <span>{{ $t('Cancel Plan') }}</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
