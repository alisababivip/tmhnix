<script setup lang="ts">
import { useEcosystemWalletStore } from '~~/store/extensions/ecosystem/wallets/user'
definePageMeta({
  title: 'Offer Details',
})

const route = useRoute()
const { uuid, id } = route.params
const { getIcoToken, createIcoContribution } = useIco()

const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const walletStore = useWalletStore()
const ecosystemWalletStore = useEcosystemWalletStore()
const wallet = ref({})

const token = ref([])
const amount = ref(0)
let intervalId: any = null
onMounted(async () => {
  const response = await getIcoToken(id)
  if (response.status === 'success') {
    token.value = response.data.result
  }
  intervalId = setInterval(() => {
    updateCountdown()
  }, 1000)
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
  if (token.value?.purchase_wallet_type === 'SPOT') {
    await walletStore.fetchWallets()
    wallet.value = walletStore.wallets[token.value?.purchase_currency] ?? {}
  }
  if (
    extensions.value['ecosystem'] &&
    token.value?.purchase_wallet_type === 'ECO'
  ) {
    await ecosystemWalletStore.fetchWallets(false, false)
    wallet.value =
      ecosystemWalletStore.wallets[token.value?.purchase_currency] ?? {}
  }
})

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isStarted: false,
})

const activePhase = computed(() => {
  return token.value?.phases?.find((phase) => phase.status === 'ACTIVE')
})

const updateCountdown = () => {
  const now = new Date()
  const start = new Date(activePhase.value?.start_date)
  const end = new Date(activePhase.value?.end_date)
  countdown.value.isStarted = now >= start
  const targetDate = countdown.value.isStarted ? end : start
  const timeRemaining = targetDate.getTime() - now.getTime()

  if (timeRemaining < 0) {
    clearInterval(intervalId)
    return
  }

  countdown.value.days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  countdown.value.hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  countdown.value.minutes = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
  )
  countdown.value.seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
}

onUnmounted(() => {
  clearInterval(intervalId)
})

const { toast } = useUtils()

const purchase = async () => {
  const response = await createIcoContribution(
    activePhase.value?.id,
    amount.value,
  )
  toast.response(response)
  if (response.status === 'success') {
    const tokenResponse = await getIcoToken(id)
    if (tokenResponse.status === 'success') {
      token.value = tokenResponse.data.result
    }
    if (token.value?.purchase_wallet_type === 'SPOT') {
      await walletStore.fetchWallets()
      wallet.value = walletStore.wallets[token.value?.purchase_currency] ?? {}
    }
    if (
      extensions.value['ecosystem'] &&
      token.value?.purchase_wallet_type === 'ECO'
    ) {
      await ecosystemWalletStore.fetchWallets(false, false)
      wallet.value =
        ecosystemWalletStore.wallets[token.value?.purchase_currency] ?? {}
    }
    amount.value = 0
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="lg">{{ token?.name }} Details</BaseHeading>
      </template>
      <template #right>
        <BaseButton type="button" color="muted" :to="`/user/ico/${uuid}`">
          <Icon name="line-md:chevron-left" class="h-4 w-4 mr-2" />
          {{ $t('Back') }}
        </BaseButton>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
        <div class="col-span-1 md:col-span-2 xl:col-span-3 space-y-5">
          <BaseCard>
            <div
              class="border-muted-200 dark:border-muted-700 flex flex-col items-center p-6 sm:flex-row"
            >
              <div class="flex flex-col items-center gap-3 sm:flex-row">
                <BaseAvatar
                  :src="token?.image"
                  :badge-src="`/img/crypto/${token?.chain}.png`"
                  :text="token?.currency"
                  size="xl"
                  class="bg-muted-500/20 text-muted-500"
                />
                <div class="text-center leading-none sm:text-left">
                  <h4
                    class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
                  >
                    {{ token?.currency }} ({{ token?.name }})
                  </h4>
                  <p class="text-muted-400 font-sans text-sm">
                    {{ token?.description }}
                  </p>
                </div>
              </div>
            </div>
          </BaseCard>
          <BaseCard class="p-4 text-sm">
            <!-- Token Details -->
            <h3 class="text-start font-bold mb-2">Token Details</h3>
            <ul class="flex flex-col gap-2">
              <li
                class="border-b border-muted-200 dark:border-muted-700 flex justify-between"
              >
                <strong>Name:</strong> {{ token.name }}
              </li>
              <li
                class="border-b border-muted-200 dark:border-muted-700 flex justify-between"
              >
                <strong>Address:</strong> {{ token.address }}
              </li>
              <li class="flex justify-between">
                <strong>Total Supply:</strong> {{ token.total_supply }}
                {{ token.currency }}
              </li>
            </ul>
          </BaseCard>
          <BaseCard
            v-if="activePhase"
            class="p-4 flex flex-col sm:flex-row justify-between text-sm"
          >
            <div class="w-full">
              <h3 class="text-start font-bold mb-2">Active Phase Details</h3>
              <ul class="flex flex-col gap-2">
                <li
                  class="flex justify-between border-b border-muted-200 dark:border-muted-700"
                >
                  <strong>Price:</strong>
                  <span
                    >{{ activePhase.price }} {{ token.purchase_currency }}</span
                  >
                </li>
                <li
                  class="flex justify-between border-b border-muted-200 dark:border-muted-700"
                >
                  <strong>Min Purchase Amount:</strong>
                  <span
                    >{{ activePhase.min_purchase }}
                    {{ token.purchase_currency }}</span
                  >
                </li>
                <li
                  class="flex justify-between border-b border-muted-200 dark:border-muted-700"
                >
                  <strong>Max Purchase Amount:</strong>
                  <span
                    >{{ activePhase.max_purchase }}
                    {{ token.purchase_currency }}</span
                  >
                </li>
                <li
                  class="flex justify-between border-b border-muted-200 dark:border-muted-700"
                >
                  <strong>Start Date:</strong>
                  <span>{{
                    new Date(activePhase.start_date).toLocaleString()
                  }}</span>
                </li>
                <li class="flex justify-between">
                  <strong>End Date:</strong>
                  <span>{{
                    new Date(activePhase.end_date).toLocaleString()
                  }}</span>
                </li>
              </ul>
            </div>
          </BaseCard>
        </div>
        <div class="space-y-5">
          <BaseCard class="space-y-5">
            <div class="w-full p-4 border-b text-center">
              <div class="w-full">
                <div v-if="countdown?.isStarted">
                  <span
                    >Ends in: {{ countdown?.days }}d {{ countdown?.hours }}h
                    {{ countdown?.minutes }}m {{ countdown?.seconds }}s</span
                  >
                </div>
                <div v-else-if="countdown">
                  <span
                    >Starts in: {{ countdown?.days }}d {{ countdown?.hours }}h
                    {{ countdown?.minutes }}m {{ countdown?.seconds }}s</span
                  >
                </div>
                <div v-else>
                  <!-- Placeholder for when countdown is not yet available -->
                </div>
              </div>
            </div>
            <div
              class="w-full grow space-y-1 px-4"
              :class="{
                'pb-4':
                  !countdown?.isStarted || activePhase?.status !== 'ACTIVE',
              }"
            >
              <div class="flex items-center justify-between">
                <h4
                  class="text-muted-700 dark:text-muted-100 font-sans text-sm font-medium"
                >
                  Progress
                </h4>
                <div>
                  <span class="text-muted-400 font-sans text-sm">
                    {{ activePhase?.contributionPercentage ?? 0 }}%
                  </span>
                </div>
              </div>
              <BaseProgress
                size="xs"
                color="primary"
                :value="activePhase?.contributionPercentage ?? 0"
              />
            </div>
            <template
              v-if="countdown?.isStarted && activePhase?.status === 'ACTIVE'"
            >
              <div
                class="border-t border-muted-200 dark:border-muted-700 pt-4 px-4"
              >
                <BaseInput
                  type="number"
                  label="Amount"
                  placeholder="Enter amount"
                  v-model="amount"
                  :min="activePhase?.min_purchase"
                  :max="activePhase?.max_purchase"
                />
              </div>
              <div class="flex justify-between items-center text-xs pt-0 px-4">
                <span class="text-muted-800 dark:text-muted-200">{{
                  $t('Balance')
                }}</span>
                <span
                  class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
                >
                  {{ wallet?.balance ?? 0 }} {{ token?.purchase_currency
                  }}<NuxtLink
                    :to="`/user/wallets/${token?.purchase_wallet_type?.toLowerCase()}/${token?.purchase_currency?.toLowerCase()}`"
                    data-nui-tooltip="Wallets"
                  >
                    <Icon name="ei:plus" class="h-5 w-5 text-success-500" />
                  </NuxtLink>
                </span>
              </div>
              <div class="px-4 pb-4">
                <BaseButton
                  class="w-full"
                  color="primary"
                  @click="purchase"
                  :disabled="
                    !amount ||
                    amount < activePhase?.min_purchase ||
                    amount > activePhase?.max_purchase ||
                    amount > wallet?.balance
                  "
                >
                  Purchase
                </BaseButton>
              </div>
            </template>
          </BaseCard>
          <BaseCard>
            <div class="w-full">
              <div
                class="flex flex-col gap-1 text-center border-b border-muted-200 dark:border-muted-700 p-4"
              >
                <BaseHeading
                  tag="h3"
                  size="md"
                  weight="semibold"
                  class="text-muted-800 dark:text-muted-100"
                >
                  <span>{{ activePhase?.name }}</span>
                </BaseHeading>
                <BaseParagraph
                  lead="none"
                  weight="semibold"
                  class="text-muted-400 !text-[0.65rem] uppercase"
                >
                  <span>Phase</span>
                </BaseParagraph>
              </div>
              <div
                class="flex flex-col gap-1 border-b border-muted-200 dark:border-muted-700 p-4 text-center"
              >
                <BaseHeading
                  tag="h3"
                  size="md"
                  weight="semibold"
                  class="text-muted-800 dark:text-muted-100"
                >
                  <span>{{
                    (((activePhase?.allocations[0]?.percentage *
                      token?.allocation?.percentage) /
                      100) *
                      token?.total_supply) /
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
              <div
                class="flex flex-col gap-1 border-b border-muted-200 dark:border-muted-700 p-4 text-center"
              >
                <BaseHeading
                  tag="h3"
                  size="md"
                  weight="semibold"
                  class="text-muted-800 dark:text-muted-100"
                >
                  <span>{{ activePhase?.contributions?.length ?? 0 }}</span>
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
          </BaseCard>
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
