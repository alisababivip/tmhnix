<script setup lang="ts">
definePageMeta({
  title: 'Investment Dashboard',
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
const investmentStore = useInvestmentStore()
const planProfit = ref(0)
const userInvestment = computed(() => investmentStore.userInvestment)
const radialGrowth = reactive(useRadialGrowth())
const { cancelInvestment } = useInvestment()
const { toast } = useUtils()
const isLoading = ref(false)

onMounted(async () => {
  if (investmentStore.userInvestment === null) {
    await investmentStore.fetchUserInvestment()
  }

  if (investmentStore.userInvestment !== null) {
    const currentDate = new Date()
    const userInvestmentCreatedAt = new Date(
      investmentStore.userInvestment?.created_at,
    )
    planProfit.value = Math.round(
      (currentDate.getTime() - userInvestmentCreatedAt.getTime()) /
        (1000 * 3600 * 24),
    )
  }
})

const endDateInDays = computed(() => {
  if (investmentStore.userInvestment === null) return null

  const currentDate = new Date()
  const userInvestmentCreatedAt = new Date(
    investmentStore.userInvestment?.created_at,
  )
  const endDate = new Date(
    userInvestmentCreatedAt.setDate(
      userInvestmentCreatedAt.getDate() +
        investmentStore.userInvestment?.plan?.duration,
    ),
  )

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

  const series = reactive([planProfit.value])

  watch(planProfit, (newProfit) => {
    series.value = [newProfit]
  })

  return {
    type,
    height,
    options,
    series,
  }
}

async function claim() {
  try {
    const response = await claimInvestmentProfit()
    toast.response(response)
  } catch (error) {
    toast.danger(error as any)
  }
}

const walletStore = useWalletStore()

async function cancel() {
  try {
    isLoading.value = true
    const response = await cancelInvestment(
      investmentStore.userInvestment?.uuid,
    )
    toast.response(response)
    if (response.status === 'success') {
      investmentStore.userInvestment = null
      await walletStore.fetchWallets()
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
  <div>
    <div class="space-y-5">
      <BaseCard class="p-5">
        <div class="flex flex-col items-center md:flex-row">
          <div
            class="ltablet:flex-row ltablet:items-center flex flex-col items-center gap-4 text-center md:items-start md:text-left lg:flex-row lg:items-center"
          >
            <BaseAvatar :src="user.avatar" size="xl" />
            <div class="text-center md:text-left">
              <BaseHeading
                as="h2"
                size="xl"
                weight="medium"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span
                  >{{ $t('Greetings') }},
                  {{ user.first_name + ' ' + user.last_name }}</span
                >
              </BaseHeading>
              <BaseParagraph>
                <span class="text-muted-400"
                  >{{
                    $t(
                      'Your personalized Investment Dashboard awaits. Take a moment to explore and make the most of your investments',
                    )
                  }}.</span
                >
              </BaseParagraph>
            </div>
          </div>

          <div
            class="ltablet:flex-row ltablet:items-center ms-auto flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center xs:mt-5 sm:mt-5 md:mt-0 xs:w-full sm:w-full md:w-auto"
          >
            <BaseCard
              class="from-primary-600 to-primary-700 shadow-primary-500/20 relative flex flex-1 items-center justify-center bg-gradient-to-br p-5 shadow-xl"
            >
              <div class="relative z-20 flex flex-col gap-3">
                <BaseParagraph size="sm">
                  <span class="text-white/80">
                    {{ $t('Start earning profit with our investment plans') }}
                  </span>
                </BaseParagraph>
                <NuxtLink
                  class="font-sans text-sm text-white underline-offset-4 hover:underline"
                  to="/user/invest/new"
                >
                  <span>{{ $t('Learn more') }}</span>
                </NuxtLink>
              </div>
              <div
                class="absolute bottom-0 end-2 z-10 flex h-14 w-14 items-center justify-center"
              >
                <Icon
                  name="ph:crown-duotone"
                  class="text-primary-900/50 h-10 w-10"
                ></Icon>
              </div>
            </BaseCard>
          </div>
        </div>
      </BaseCard>
      <div
        class="flex flex-col md:flex-row gap-5 pb-20"
        v-if="userInvestment !== null"
      >
        <div class="flex-1 h-full">
          <BaseCard shape="rounded" class="min-w-sm">
            <div class="flex gap-12">
              <img
                :src="
                  investmentStore.userInvestment?.plan?.image ||
                  '/img/placeholder.png'
                "
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
                    {{ investmentStore.userInvestment?.plan?.title }}
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
                      <span class="text-gray-800 dark:text-gray-200"
                        >{{ investmentStore.userInvestment?.amount }}
                        {{
                          investmentStore.userInvestment?.plan?.currency
                        }}</span
                      ></span
                    >
                  </li>
                  <li class="flex items-center gap-2 text-success-500">
                    <Icon
                      name="fluent:chevron-right-12-filled"
                      class="h-3 w-3 text-current"
                    />
                    <span class="text-muted-400"
                      >{{ $t('Profit') }}:
                      <span class="text-gray-800 dark:text-gray-200"
                        >{{
                          investmentStore.userInvestment?.amount *
                          (investmentStore.userInvestment?.plan?.roi / 100)
                        }}
                        {{
                          investmentStore.userInvestment?.plan?.currency
                        }}</span
                      ></span
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
                        investmentStore.userInvestment?.plan?.roi + '%'
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
                    {{
                      formatDate(investmentStore.userInvestment?.created_at)
                    }}</span
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
        <BaseCard class="p-6 flex-1 h-full">
          <PlaceholderCompact>
            <template #image>
              <img
                src="/img/illustrations/placeholders/flat/chart-guy.svg"
                class="block w-full dark:hidden"
                width="225"
                height="150"
                alt="Placeholder illustration"
              />
              <img
                src="/img/illustrations/placeholders/flat/chart-guy-dark.svg"
                class="hidden w-full dark:block"
                width="225"
                height="150"
                alt="Placeholder illustration"
              />
            </template>
            <BaseHeading
              as="h4"
              size="lg"
              weight="light"
              lead="tight"
              class="text-muted-800 mb-1 dark:text-white"
            >
              <span>{{ $t('Upgrade Investment Plan') }}</span>
            </BaseHeading>
            <BaseParagraph size="sm">
              <span class="text-muted-400">
                {{ $t('Upgrade your investment plan to earn more profit') }}
              </span>
            </BaseParagraph>
            <template #action>
              <NuxtLink to="/user/invest/new">
                <BaseButton color="primary" shape="rounded" class="w-full">
                  <span>{{ $t('Upgrade Plan') }}</span>
                </BaseButton>
              </NuxtLink>
            </template>
          </PlaceholderCompact>
        </BaseCard>
      </div>

      <div v-else class="flex min-h-[400px] items-center justify-center">
        <div
          class="flex flex-col md:flex-row items-center mx-auto w-full text-center"
        >
          <LottieAnalytics height="500px" />
          <div class="mx-auto max-w-sm">
            <BaseHeading
              as="h4"
              weight="medium"
              size="xl"
              class="text-muted-800 mb-1 mt-4 dark:text-white"
            >
              {{ $t('Unlock Your Earning Potential') }}!
            </BaseHeading>
            <p class="text-muted-400 font-sans text-sm">
              {{
                $t(
                  "It looks like you're missing out on incredible earning opportunities. Click below to leap into a world of smart, secure, and profitable investments",
                )
              }}.
            </p>

            <div class="mt-2 flex justify-center gap-2">
              <NuxtLink to="/user/invest/new">
                <BaseButton color="primary" shape="rounded">
                  <span>{{ $t('Start Investing') }}</span>
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
    <Faqs category="INVESTMENT" />
  </div>
</template>
