<script setup lang="ts">
import { useUserInvestmentPlanStore } from '~~/store/investment/plan'
definePageMeta({
  title: 'Start Investing',
})

const investmentPlanStore = useUserInvestmentPlanStore()
const investmentStore = useInvestmentStore()
const { createInvestment } = useInvestment()
const walletStore = useWalletStore()
const { toast } = useUtils()
const router = useRouter()

const amount = ref()
const isSubmitting = ref(false)
const customRadio = ref(investmentStore.userInvestment?.plan?.name || '')

onMounted(async () => {
  if (walletStore.wallets.length === 0) {
    await walletStore.fetchWallets()
  }

  if (investmentPlanStore.plans.length === 0) {
    await investmentPlanStore.fetchInvestmentPlans()
  }
  if (investmentPlanStore.plans.length === 0) {
    router.push('/user/invest')
    toast.dangerText('No investment plan available, please check back later')
  }
  if (plans.value.length > 0) {
    customRadio.value = plans.value[0].name
  }

  if (!investmentStore.userInvestment) {
    await investmentStore.fetchUserInvestment()
  }
})

const plans = computed(() => {
  return investmentPlanStore.plans.filter((item) => item.status)
})

const selectedPlan = computed(() => {
  return plans.value.find((plan) => plan.name === customRadio.value)
})

const selectedWallet = computed(() => {
  return walletStore.wallets[selectedPlan.value?.currency] || null
})

// Create Method
const create = async () => {
  if (!selectedPlan.value) {
    toast.dangerText('Please select a plan')
    return
  }

  if (!amount.value) {
    toast.dangerText('Please enter amount')
    return
  }

  if (amount.value < selectedPlan.value.min_amount) {
    toast.dangerText('Amount is less than minimum amount')
    return
  }

  if (amount.value > selectedPlan.value.max_amount) {
    toast.dangerText('Amount is greater than maximum amount')
    return
  }

  if (!selectedWallet.value) {
    toast.dangerText(
      `You don't have a fiat wallet for ${selectedPlan.value.currency}`,
    )
    return
  }

  if (amount.value > selectedWallet.value.balance) {
    toast.dangerText('Insufficient balance')
    return
  }
  isSubmitting.value = true
  try {
    const response = await createInvestment(
      selectedPlan.value?.id,
      amount.value,
    )
    toast.response(response)
    if (response.status === 'success') {
      investmentStore.userInvestment = response.data.result
      await walletStore.fetchWallets()
      router.push('/user/invest')
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isSubmitting.value = false
}
</script>

<template>
  <form
    action=""
    method="POST"
    @submit.prevent
    class="mx-auto w-full max-w-4xl pb-16"
  >
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between md:flex-row md:items-center">
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
            <span>{{ $t('Select a plan') }}</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              {{
                $t(
                  'Select a plan that works for you. You can always change your plan later',
                )
              }}.
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div
        class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
      >
        <NuxtLink to="/user/invest">
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
    <!-- plans -->
    <div
      class="dark:border-muted-800 mb-10 grid gap-4 pb-10 md:grid-cols-2 xl:gap-8"
    >
      <div class="flex flex-col gap-3">
        <BaseRadioHeadless
          v-for="plan in plans"
          v-model="customRadio"
          name="radio_custom"
          :value="plan.name"
        >
          <BaseCard
            shape="rounded"
            class="text-muted-400/50 peer-checked:!border-success-500 peer-checked:text-success-500 group relative text-center peer-checked:[&_.child]:!opacity-100"
          >
            <div
              class="child border-muted-200 dark:border-muted-700 dark:bg-muted-800 absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border bg-white opacity-0"
            >
              <Icon name="lucide:check" class="h-3 w-3 text-current" />
            </div>
            <div class="flex items-center justify-start gap-5">
              <img
                :src="plan?.image || '/img/placeholder.png'"
                loading="lazy"
                class="rounded-l w-16 h-16 object-cover"
              />
              <BaseHeading
                as="h4"
                size="sm"
                weight="medium"
                class="text-muted-800 dark:text-white"
              >
                {{ plan.title }}
              </BaseHeading>
            </div>
          </BaseCard>
        </BaseRadioHeadless>
      </div>
      <div>
        <BaseCard shape="rounded">
          <div class="flex gap-12">
            <img
              :src="selectedPlan?.image || '/img/placeholder.png'"
              loading="lazy"
              class="w-full mb-4 rounded-t-lg h-64 object-cover"
            />
          </div>
          <div class="space-y-4">
            <div class="px-5">
              <div>
                <BaseParagraph size="xl">
                  {{ selectedPlan?.title }}
                </BaseParagraph>
              </div>
              <BaseParagraph
                size="sm"
                lead="tight"
                class="text-muted-500 dark:text-muted-400"
              >
                {{ selectedPlan?.description }}
              </BaseParagraph>
            </div>

            <div class="font-sans text-xs px-5">
              <div>
                <ul>
                  <li class="flex items-center gap-2 text-success-500">
                    <Icon
                      name="fluent:chevron-right-12-filled"
                      class="h-3 w-3 text-current"
                    />
                    <span class="text-muted-400"
                      >{{ $t('Return of investment') }}:
                      <span class="text-gray-800 dark:text-gray-200"
                        >{{ selectedPlan?.roi }}%</span
                      ></span
                    >
                  </li>
                  <li class="flex items-center gap-2 text-success-500">
                    <Icon
                      name="fluent:chevron-right-12-filled"
                      class="h-3 w-3 text-current"
                    />
                    <span class="text-muted-400"
                      >{{ $t('Duration') }}:
                      <span class="text-gray-800 dark:text-gray-200">{{
                        selectedPlan?.duration +
                        ' ' +
                        (selectedPlan?.duration > 1 ? 'days' : 'day')
                      }}</span></span
                    >
                  </li>
                  <li class="flex items-center gap-2 text-success-500">
                    <Icon
                      name="fluent:chevron-right-12-filled"
                      class="h-3 w-3 text-current"
                    />
                    <span class="text-muted-400"
                      >{{ $t('Minimum Amount') }}:
                      <span class="text-gray-800 dark:text-gray-200">{{
                        selectedPlan?.min_amount + ' ' + selectedPlan?.currency
                      }}</span></span
                    >
                  </li>
                  <li class="flex items-center gap-2 text-success-500">
                    <Icon
                      name="fluent:chevron-right-12-filled"
                      class="h-3 w-3 text-current"
                    />
                    <span class="text-muted-400"
                      >{{ $t('Maximum Amount') }}:
                      <span class="text-gray-800 dark:text-gray-200">{{
                        selectedPlan?.max_amount + ' ' + selectedPlan?.currency
                      }}</span></span
                    >
                  </li>
                </ul>
              </div>
            </div>
            <div
              class="border-t pt-2 border-gray-200 dark:border-gray-700 space-y-2 p-5"
            >
              <BaseInput
                v-model="amount"
                type="number"
                label="Amount"
                placeholder="Enter amount"
                shape="rounded"
                class="w-full"
                :min="selectedPlan?.min_amount"
                :max="selectedPlan?.max_amount"
                autocomplete="off"
              />
              <div class="flex justify-between items-center text-xs pt-2">
                <span class="text-muted-800 dark:text-muted-200">{{
                  $t('Balance')
                }}</span>
                <span
                  class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
                  >{{ selectedWallet?.balance || 0 }}
                  {{ selectedPlan?.currency }}
                  <NuxtLink to="/user/wallets/fiat" data-nui-tooltip="Wallets">
                    <Icon
                      name="ei:plus"
                      class="h-5 w-5 text-success-500"
                    /> </NuxtLink
                ></span>
              </div>
              <BaseButton
                type="submit"
                color="success"
                @click="create"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-success-500 text-white rounded hover:bg-success-600 w-full"
              >
                {{ $t('Start Investing') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </form>
</template>
