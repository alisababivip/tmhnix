<script setup lang="ts">
definePageMeta({
  permissions: ['Access Ecosystem Management'],
  title: 'Ecosystem Blockchains',
})

const { setEcosystemPassphrase, getEcosystemAnalytics } = useEcosystem()
const blockchains = ref<any>({})

async function fetchBlockchains() {
  const response = await getEcosystemAnalytics()
  if (response.status === 'success') {
    blockchains.value = response.data.result
  }
}
onMounted(async () => {
  await fetchBlockchains()
})
const { toast } = useUtils()

const isSubmitting = ref(false)
const isPassPhraseModelOpen = ref(false)
const passphrase = ref('')
const supportedChainsImagesMap = (chain: string) => {
  switch (chain) {
    case 'ETH':
      return 'eth'
    case 'BSC':
      return 'bnb'
    case 'POLYGON':
      return 'matic'
    case 'FTM':
      return 'ftm'
    case 'OPTIMISM':
      return 'op'
    case 'ARBITRUM':
      return 'arbitrum'
    case 'BASE':
      return 'base'
    case 'CELO':
      return 'celo'
    case 'BTC':
      return 'btc'
    case 'LTC':
      return 'ltc'
    case 'DOGE':
      return 'doge'
    case 'DASH':
      return 'dash'
  }
}
async function setPassphrase() {
  isSubmitting.value = true
  try {
    const response = await setEcosystemPassphrase(passphrase.value)
    toast.response(response)
    if (response.status === 'success') {
      await fetchBlockchains()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isSubmitting.value = false
  isPassPhraseModelOpen.value = false
  passphrase.value = ''
}

const utxoChains = ['BTC', 'LTC', 'DOGE', 'DASH']
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4">
      <!-- Tile -->
      <div
        class="relative"
        v-for="(item, index) in blockchains.metrics"
        :key="index"
      >
        <BaseCard class="space-y-1 p-5">
          <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
            {{ item.metric }}
          </BaseParagraph>
          <BaseHeading
            size="lg"
            weight="semibold"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ item.value }}</span>
          </BaseHeading>
        </BaseCard>
      </div>
    </div>
    <div>
      <BaseCard class="space-y-5 p-5">
        <div class="flex justify-between items-center">
          <div>
            <BaseHeading
              size="lg"
              weight="semibold"
              class="text-muted-800 dark:text-white"
            >
              <span>{{ $t('Ecosystem Blockchains') }}</span>
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
              {{ $t('Manage the blockchains of the ecosystem') }}
            </BaseParagraph>
          </div>
          <BaseTag
            v-if="blockchains.isUnlockedVault"
            shape="rounded"
            color="success"
            flavor="pastel"
            class="flex items-center gap-2"
          >
            <Icon name="line-md:confirm-circle" size="16" />
            Vault Active</BaseTag
          >
          <BaseButton
            v-else-if="!blockchains.isUnlockedVault"
            color="success"
            @click="isPassPhraseModelOpen = true"
            class="ms-2"
          >
            <Icon name="lucide:lock" size="16" class="mr-2" />
            {{ $t('Initiate Vault') }}</BaseButton
          >
        </div>
        <div
          class="grid gap-5 mt-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <div v-for="(item, index) in blockchains.chains" :key="index">
            <div
              :class="{
                'grayscale-0':
                  (utxoChains.includes(item.chain) && item.info.nodeProvider) ||
                  (item.info.rpc && item.info.rpcWss && item.info.explorerApi),
                grayscale:
                  (utxoChains.includes(item.chain) &&
                    !item.info.nodeProvider) ||
                  !item.info.rpc ||
                  !item.info.rpcWss ||
                  !item.info.explorerApi,
              }"
            >
              <BaseAvatar
                :src="`/img/crypto/${supportedChainsImagesMap(item.chain)}.png`"
                shape="full"
                size="md"
              />
            </div>
            <span class="text-sm"
              >{{ item.chain }} ({{ item.info.network }})</span
            >
            <ul class="text-xs">
              <template v-if="utxoChains.includes(item.chain)">
                <li>
                  <span class="text-muted-500">Node: </span
                  ><span class="text-info-500">{{
                    item.info.nodeProvider
                  }}</span>
                </li>
              </template>
              <template v-else>
                <li
                  class="flex items-center gap-2"
                  :class="{
                    'text-success-500': item.info.rpc,
                    'text-danger-500': !item.info.rpc,
                  }"
                >
                  <Icon
                    :name="item.info.rpc ? 'lucide:check' : 'lucide:x'"
                    class="h-3 w-3 text-current"
                  />
                  RPC
                </li>
                <li
                  class="flex items-center gap-2"
                  :class="{
                    'text-success-500': item.info.rpcWss,
                    'text-danger-500': !item.info.rpcWss,
                  }"
                >
                  <Icon
                    :name="item.info.rpcWss ? 'lucide:check' : 'lucide:x'"
                    class="h-3 w-3 text-current"
                  />
                  RPC WSS
                </li>
                <li
                  class="flex items-center gap-2"
                  :class="{
                    'text-success-500': item.info.explorerApi,
                    'text-danger-500': !item.info.explorerApi,
                  }"
                >
                  <Icon
                    :name="item.info.explorerApi ? 'lucide:check' : 'lucide:x'"
                    class="h-3 w-3 text-current"
                  />
                  Explorer API
                </li>
              </template>
            </ul>
          </div>
        </div>
      </BaseCard>
    </div>
    <TairoModal
      :open="isPassPhraseModelOpen"
      size="sm"
      @close="isPassPhraseModelOpen = false"
    >
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Set Ecosystem Passphrase') }}
          </h3>

          <BaseButtonClose @click="isPassPhraseModelOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please enter the passphrase of the ecosystem vault') }}.
          </p>

          <BaseInput
            v-model="passphrase"
            label="Passphrase"
            placeholder="Enter passphrase"
            type="password"
            :disabled="isSubmitting"
            :loading="isSubmitting"
          />
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isPassPhraseModelOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="setPassphrase()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Submit') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
