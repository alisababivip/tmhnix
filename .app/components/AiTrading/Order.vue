<script setup lang="ts">
import { useAiTradingPlanStore } from '~~/store/extensions/ai-trading/plans'
import { useAiTradingInvestmentStore } from '~~/store/extensions/ai-trading/investment'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'

import 'vue3-carousel/dist/carousel.css'
const props = defineProps({
  currency: {
    type: String,
    required: true,
  },
  pair: {
    type: String,
    required: true,
  },
})

const config = useRuntimeConfig()
const provider =
  config.public.appActiveExchange !== null &&
  config.public.appActiveExchange !== undefined &&
  config.public.appActiveExchange !== ''
    ? config.public.appActiveExchange
    : null
const marketStore = useMarketStore()
const userStore = useUserStore()
const isGeneratingFailed = ref(false)
const walletStore = useWalletStore()
const { createSpotWallet } = useWallet()
const aiTraidingStore = useAiTradingInvestmentStore()
async function createWallet(currency: string) {
  try {
    const data = await createSpotWallet(currency as string)
    walletStore.wallets[currency] = data.data.result
  } catch (error) {
    isGeneratingFailed.value = true
  }
}

const amountPrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.amount) || 4
  return Math.abs(precision)
})

const isLoading = ref(false)
const aiTradingPlanStore = useAiTradingPlanStore()
const plans = computed(() => aiTradingPlanStore.plans)
const durations = computed(
  () =>
    selectedPlan.value?.ai_trading_plan_duration?.map((item) => ({
      label: `${item.duration?.duration || ''} ${
        item.duration?.timeframe?.toLowerCase() || ''
      }`.trim(),
      value: item.duration?.id,
    })) || [],
)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    isLoading.value = true
    if (walletStore.wallets.length === 0) {
      await walletStore.fetchWallets()
    }

    if (
      walletStore.wallets[props.pair] === undefined ||
      walletStore.wallets[props.pair] === null
    ) {
      await createWallet(props.pair)
    }
    isLoading.value = false
  }
  if (aiTradingPlanStore.plans.length === 0) {
    await aiTradingPlanStore.fetchAiTradingPlans()
  }
})

const pairWallet = computed(() => {
  return walletStore.wallets[props.pair] || null
})

const showOrderContent = ref(false)
const isOrdering = ref(false)

const amount = computed(() => {
  return marketStore.order?.amount || 0
})

watch(
  () => marketStore.order.percentage,
  (newVal) => {
    if (!userStore.isLoggedIn) return
    if (newVal === 0) {
      marketStore.order.amount = 0
      return
    }
    if (newVal > 99) {
      marketStore.order.amount =
        pairWallet.value?.balance.toFixed(amountPrecision.value || 2) || 0
      return
    }
    const availableBalance = walletStore.wallets[props.pair]?.balance || 0
    const amountBeforeFees = availableBalance * (newVal / 100)
    marketStore.order.amount = Math.round(amountBeforeFees)
  },
)

const { createOrder } = useAiTrading()
const { toast } = useUtils()
async function storeOrder() {
  if (!userStore.isLoggedIn) {
    toast.dangerText('Please login to place an order')
    return
  }
  if (marketStore.order.amount === 0) {
    toast.dangerText('Please enter an amount')
    return
  }

  if (amount.value > pairWallet.value?.balance) {
    toast.dangerText('Insufficient balance')
    return
  }
  if (!selectedDuration.value) {
    toast.dangerText('Please select a duration')
    return
  }

  isOrdering.value = true
  try {
    const response = await createOrder(
      selectedPlan.value?.id,
      selectedDuration.value?.value,
      marketStore.order.amount,
      props.currency,
      props.pair,
    )
    toast.response(response)
    if (response.status === 'success') {
      selectedPlan.value = null
      selectedDuration.value = null
      marketStore.order.amount = 0
      marketStore.order.percentage = 0
      aiTraidingStore.investments.push(response.data.result)
      await walletStore.fetchWallets()
      await aiTraidingStore.fetchActiveInvestments()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isOrdering.value = false
}
const isDeveloping = ref(true)
const selectedPlan = ref(null)
const isPlansOpen = ref(false)
const selectedDuration = ref(null)
const selectPlan = (plan: any) => {
  if (selectedPlan.value?.id !== plan.id) {
    selectedDuration.value = null
  }
  selectedPlan.value = plan
  isPlansOpen.value = false
}
const toggleContent = (side: string) => {
  showOrderContent.value = !showOrderContent.value
}
</script>

<template>
  <div
    class="bg-gray-50 shadow w-full"
    :class="{
      'rounded-l-lg h-full dark:bg-gray-900': $viewport.isGreaterOrEquals('sm'),
      'absolute bottom-0 dark:bg-gray-800': $viewport.isLessThan('sm'),
      'h-[460px]': showOrderContent && $viewport.isLessThan('sm'),
    }"
  >
    <div
      class="flex w-full relative px-2 py-3"
      v-if="$viewport.isLessThan('sm')"
    >
      <BaseButton
        shape="rounded"
        shadow="flat"
        class="w-full"
        @click="toggleContent"
        color="primary"
        condensed
      >
        <span class="text-md font-heading">
          <Icon
            :name="`line-md:chevron-down`"
            class="h-4 w-4"
            v-if="showOrderContent"
          />
          <span v-else>
            <Icon :name="`line-md:chevron-up`" class="h-4 w-4" />
            {{ $t('Invest Now') }}</span
          >
        </span>
      </BaseButton>
    </div>
    <div
      class="h-full dark:bg-gray-900"
      v-show="showOrderContent || $viewport.isGreaterOrEquals('sm')"
    >
      <div
        class="relative"
        :class="{
          'pt-1 h-[calc(100%-32px)] ': !isDeveloping,
          'rounded-tl-lg h-full ': isDeveloping,
        }"
        role="tabpanel"
        aria-labelledby="spot-tab"
      >
        <div class="space-y-2 pt-2">
          <div class="flex justify-between px-2 text-xs">
            <span class="text-gray-500 dark:text-gray-400">{{
              $t('Available')
            }}</span>
            <span class="text-gray-700 dark:text-gray-200">{{
              (pairWallet?.balance.toFixed(amountPrecision || 2) || 0) +
              ' ' +
              pair
            }}</span>
          </div>
          <div class="px-2 space-y-2">
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full duration-300"
              enter-to-class="opacity-100 translate-x-0 duration-300"
              leave-active-class="transform-gpu duration-300"
              leave-from-class="opacity-100 translate-x-0 duration-300"
              leave-to-class="opacity-0 -translate-x-full duration-300"
            >
              <BaseButton
                key="plansButton"
                color="primary"
                class="w-full mt-1"
                flavor="pastel"
                @click="isPlansOpen = true"
              >
                {{ selectedPlan ? selectedPlan.title : $t('Select Plan') }}
              </BaseButton>
              <TairoGroupInput
                v-model="marketStore.order.amount"
                key="amount"
                shape="rounded"
                autocomplete="off"
                placeholder="Amount"
                type="number"
                :inputText="pair"
                :min="selectedPlan?.min_amount"
              />
              <div key="orderRange" class="pb-10">
                <AiTradingOrderRange
                  range="0"
                  :min="0"
                  :max="100"
                  :isLeverage="false"
                  :pair="pair"
                />
              </div>
              <BaseListbox
                key="duration"
                v-model="selectedDuration"
                :items="durations || []"
                :properties="{ label: 'label', value: 'value' }"
                placeholder="Please select a duration"
                label="Duration"
                shape="rounded"
                :disabled="
                  durations?.length === 0 ||
                  isOrdering ||
                  !provider ||
                  !selectedPlan
                "
                :loading="
                  !durations ||
                  durations?.length === 0 ||
                  isLoading ||
                  isOrdering ||
                  !provider ||
                  !selectedPlan
                "
              />
            </TransitionGroup>
          </div>
        </div>
        <div
          class="w-full absolute space-y-2"
          :class="{
            'bottom-20': $viewport.isLessThan('sm'),
            'bottom-2': $viewport.isGreaterOrEquals('sm'),
          }"
        >
          <hr class="border-gray-200 dark:border-gray-700" />
          <div class="flex justify-between px-2 text-xs" key="total">
            <span class="text-gray-500 dark:text-gray-400">{{
              $t('Min Amount')
            }}</span>
            <span class="text-gray-700 dark:text-gray-300"
              >{{ selectedPlan?.min_amount }} {{ pair }}</span
            >
          </div>
          <div class="flex justify-between px-2 text-xs" key="total">
            <span class="text-gray-500 dark:text-gray-400">{{
              $t('Max Amount')
            }}</span>
            <span class="text-gray-700 dark:text-gray-300"
              >{{ selectedPlan?.max_amount }} {{ pair }}</span
            >
          </div>
          <div class="px-2">
            <BaseButton
              v-if="userStore.isLoggedIn"
              :disabled="
                isOrdering ||
                !walletStore.wallets[pair] ||
                amount < selectedPlan?.min_amount ||
                amount > selectedPlan?.max_amount ||
                !provider ||
                !selectedPlan ||
                !selectedDuration
              "
              :loading="isOrdering || isLoading"
              key="buyButton"
              shape="rounded"
              shadow="flat"
              class="w-full"
              :color="
                !walletStore.wallets[pair] || !provider ? 'danger' : 'success'
              "
              @click="storeOrder"
            >
              <span v-if="!walletStore.wallets[pair]">{{
                $t('Wallet Generation Failed')
              }}</span>
              <span v-else-if="!provider">
                {{ $t('Exchange is offline') }}
              </span>
              <span v-else class="text-lg font-heading">
                <Icon name="bi:battery-charging" class="h-5 w-5" />
                {{ $t('Invest') }}</span
              >
            </BaseButton>

            <div
              v-else
              style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
              class="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex text-center justify-center"
            >
              <NuxtLink class="text-warning-500 mr-1" to="/login">{{
                $t('Login')
              }}</NuxtLink>
              {{ $t('or') }}
              <NuxtLink class="text-warning-500 ml-1" to="/register">{{
                $t('Register')
              }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TairoModal
      :open="isPlansOpen"
      size="lg"
      @close="isPlansOpen = false"
      key="isPlansOpenModel"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between px-4 md:px-6 pt-4">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Select Plan') }}
          </h3>

          <BaseButtonClose @click="isPlansOpen = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="px-4 md:px-6 pb-4">
        <div class="mx-auto w-full text-center">
          <Carousel>
            <Slide v-for="(slide, index) in plans" :key="index">
              <div
                class="carousel__item flex w-full flex-col justify-center items-center rounded-lg cursor-pointer relative"
                :style="`background-image: url(${slide.image});background-size: cover;background-position: center;background-repeat: no-repeat;`"
                @click="selectPlan(slide)"
              >
                <div
                  class="px-2 bg-gray-900/50 dark:bg-gray-100/50 rounded-lg text-gray-100 dark:text-gray-900"
                >
                  <div class="font-semibold">
                    {{ slide.title }}
                  </div>
                  <div class="text-sm text-gray-300 dark:text-gray-700">
                    {{ slide.description }}
                  </div>
                </div>
                <div class="absolute top-2 right-2">
                  <BaseIconBox
                    size="md"
                    class="bg-red-100/80 text-red-500 dark:border-2 dark:border-red-500 dark:bg-red-500/20 dark:text-red-400"
                    data-nui-tooltip="Trending"
                    data-nui-tooltip-position="left"
                  >
                    <Icon name="ph:fire-duotone" class="h-5 w-5" />
                  </BaseIconBox>
                </div>
              </div>
            </Slide>

            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </Carousel>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
<style scoped>
.carousel__item {
  min-height: 200px;
  font-size: 20px;
}

.carousel__slide {
  padding: 10px;
}

.carousel__prev,
.carousel__next {
  box-sizing: content-box;
  border: 5px solid white;
}
</style>
