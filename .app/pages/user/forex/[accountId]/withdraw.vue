<script setup lang="ts">
import { useForexAccountStore } from '~~/store/extensions/forex/account'
definePageMeta({
  title: 'Withdraw',
})

const route = useRoute()
const router = useRouter()
const { toast } = useUtils()
const { storeWithdrawTransaction } = useForex()
const forexAccountStore = useForexAccountStore()
const account = computed(() => forexAccountStore.accounts['LIVE'])

const { accountId } = route.params

const withdrawAmount = ref(0)
const isWithdrawing = ref(false)
const selectedCurrency = ref(null)

const { getForexCurrencies } = useForex()
const currencies = ref([])

onMounted(async () => {
  const response = await getForexCurrencies()
  if (response.status === 'success') {
    currencies.value = response.data.result
  }
  if (forexAccountStore.accounts?.length === 0) {
    await forexAccountStore.fetchAccounts()
  }
})

async function withdraw() {
  isWithdrawing.value = true
  if (!selectedCurrency.value) {
    toast.dangerText('Please select a wallet')
    return
  }

  try {
    const response = await storeWithdrawTransaction(
      accountId,
      selectedCurrency.value,
      withdrawAmount.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      router.push(`/user/forex`)
    }
  } catch (e) {
    toast.danger(e)
  }
  isWithdrawing.value = false
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="xl">
          {{ $t('Withdraw') }} from account ID: {{ accountId }}
        </BaseHeading>
      </template>
      <template #right>
        <div>
          <BaseButton to="/user/forex" color="muted" flavor="pastel">
            <Icon name="line-md:chevron-left" class="h-4 w-4" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButton>
        </div>
      </template>

      <div class="space-y-5 min-h-screen pb-20">
        <div>
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white items-center flex"
          >
            <Icon
              name="line-md:loading-alt-loop"
              class="h-6 w-6 mr-2"
              v-if="!selectedCurrency"
            />
            <Icon name="line-md:confirm-circle" class="h-6 w-6 mr-2" v-else />
            {{ $t('Select Wallet Currency') }}
          </BaseHeading>
          <BaseListbox
            class="max-w-sm mt-5 pl-8 z-40"
            v-model="selectedCurrency"
            :items="
              currencies.length > 0
                ? currencies?.map((item) => item.currency)
                : ['No currencies available']
            "
            placeholder="Select a wallet"
            shape="rounded"
          />
        </div>
        <template v-if="selectedCurrency && selectedCurrency.value !== null">
          <hr class="border-gray-200 dark:border-gray-700" />
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white flex items-center gap-2"
          >
            <Icon name="line-md:downloading-loop" class="h-6 w-6" />
            {{ $t('Withdrawal Details') }}
          </BaseHeading>
          <div class="space-y-5 pl-8">
            <div class="w-full">
              <BaseInput
                v-model="withdrawAmount"
                :key="selectedCurrency"
                shape="rounded"
                type="number"
                label="Withdraw amount"
                placeholder="Enter your withdraw amount..."
              />
            </div>
            <small>Account Balance: {{ account?.balance }}</small>
          </div>

          <hr class="border-gray-200 dark:border-gray-700" />
          <div>
            <BaseButton
              class="w-full"
              color="success"
              @click="withdraw"
              :disabled="
                !withdrawAmount ||
                isWithdrawing ||
                withdrawAmount > account?.balance
              "
              :loading="isWithdrawing"
              >{{ $t('Withdraw') }}</BaseButton
            >
          </div>
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
