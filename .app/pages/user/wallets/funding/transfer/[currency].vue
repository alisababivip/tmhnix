<script setup lang="ts">
import { validate } from 'uuid'
definePageMeta({
  title: 'Transfer',
})

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { toast } = useUtils()
const { transferFunds, getWallet } = useEcosystem()

const currency = getCurrency()
const wallet = computed(() => walletStore.wallet)
const targetUser = ref('')
const transferAmount = ref(0)

onMounted(async () => {
  await fetchWalletAndCurrencies()
})

async function fetchWalletAndCurrencies() {
  try {
    await getWallet(currency)
  } catch (error) {
    router.push('/user/wallets/funding')
  }
}

function getCurrency() {
  return route.params.currency.toUpperCase()
}

async function transfer() {
  if (!targetUser.value) {
    toast.dangerText('Please enter a valid user uuid')
    return
  }

  // Validate UUID format
  if (!validate(targetUser.value)) {
    toast.dangerText('Invalid UUID format')
    return
  }

  try {
    const response = await transferFunds(
      targetUser.value,
      wallet.value?.currency as string,
      transferAmount.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      router.push(`/user/wallets/funding/${currency.toLowerCase()}`)
    }
  } catch (e: any) {
    toast.danger(e)
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="xl">
          {{ currency }} {{ $t('Transfer') }}
        </BaseHeading>
      </template>
      <template #right>
        <div>
          <BaseButton
            :to="`/user/wallets/funding/${currency.toLowerCase()}`"
            color="muted"
            flavor="pastel"
          >
            <Icon name="line-md:chevron-left" class="h-4 w-4" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButton>
        </div>
      </template>

      <div class="space-y-5 min-h-screen pb-20">
        <BaseHeading
          as="h3"
          size="2xl"
          weight="bold"
          class="text-muted-800 dark:text-white"
        >
          <Icon name="line-md:downloading-loop" class="h-6 w-6 mr-2" />
          {{ $t('Transfer Details') }}
        </BaseHeading>
        <div class="space-y-5 pl-8">
          <div class="w-full">
            <BaseInput
              v-model="targetUser"
              shape="rounded"
              type="text"
              label="User UUID"
              placeholder="Enter target user UUID..."
              icon="ph:user-duotone"
            />
          </div>
          <div class="w-full">
            <BaseInput
              v-model="transferAmount"
              :max="wallet?.balance"
              shape="rounded"
              type="number"
              label="Transfer amount"
              placeholder="Enter transfer amount..."
              icon="flat-color-icons:money-transfer"
              :error="
                transferAmount !== 0
                  ? transferAmount > Number(wallet?.balance)
                    ? `Insufficient balance`
                    : false
                  : 'Must be greater than 0'
              "
            />
          </div>
        </div>

        <hr class="border-gray-200 dark:border-gray-700" />
        <div>
          <BaseButton
            class="w-full"
            color="success"
            @click="transfer"
            :disabled="!targetUser || !transferAmount"
            >{{ $t('Transfer') }}</BaseButton
          >
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
