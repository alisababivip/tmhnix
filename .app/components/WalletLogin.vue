<script lang="ts" setup>
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { mainnet, arbitrum, polygon, bsc, fantom, avalanche } from 'viem/chains'
import {
  useAccount,
  useDisconnect,
  useSignMessage,
  useNetwork,
} from 'use-wagmi'

import { useWeb3Modal } from '@web3modal/wagmi/vue'
const config = useRuntimeConfig()
const projectId = config.public.wCProjectId

// Web3Modal and Wagmi configuration
const chains = [mainnet, arbitrum, polygon, bsc, fantom, avalanche]
const chainIdToName = {
  1: 'ETH',
  56: 'BSC',
  137: 'POLYGON',
  250: 'FTM',
  43114: 'AVAX',
  42161: 'ARB',
}

const networkName = computed(() => {
  if (chain.value) {
    return chainIdToName[chain.value.id] || 'Unknown Network'
  }
  return 'Loading...'
})
const modal: any = ref(null)

const wagmiConfig = defaultWagmiConfig({ chains, projectId })
onMounted(async () => {
  // Create Web3Modal
  createWeb3Modal({ wagmiConfig, projectId, chains })

  // 4. Use modal composable
  modal.value = useWeb3Modal() as any
})

// Wagmi hooks
const { isConnected, address } = useAccount()
const { disconnect } = useDisconnect()
const { chain } = useNetwork()
const { signMessage, data: signedData, error } = useSignMessage()

watchEffect(() => {
  if (error.value) {
    toast.dangerText(error.value.shortMessage)
    isLoggingIn.value = false
  }
})

// Auth and Utils
const { generateNonce, verifyMessage } = useAuth()
const { toast } = useUtils()

const walletAddress: any = ref(address.value)

// Watch for changes in wallet address
watch(address, (newAddress) => {
  walletAddress.value = newAddress
})

// Login logic
const isLoggingIn = ref(false)
const router = useRouter()
const userStore = useUserStore()

const handleWalletLogin = async (address: string) => {
  isLoggingIn.value = true

  try {
    // Step 1: Generate a nonce
    const nonceResponse = await generateNonce()
    const nonce = nonceResponse.data.result.nonce
    if (!nonce) throw new Error('Nonce not found')
    const message = `
Welcome to ${config.public.siteName},

To confirm your identity, please sign this message. This action does not initiate any transaction or cost any gas fees.

Nonce: ${nonce}

Thank you for using our service.
`
    // Step 2: Sign the nonce
    await signMessage({ message })

    // Step 3: Verify the signature once signedData is available
    watchEffect((onInvalidate) => {
      if (!signedData.value) return

      const verifySignature = async () => {
        const signature = signedData.value
        const verifyResponse = await verifyMessage(message, signature, address)

        if (verifyResponse.status === 'success') {
          // Step 4: Complete the login process
          toast.successText('You have been logged in successfully')
          await userStore.fetchProfile()
          router.push('/user')
        } else {
          toast.dangerText('Signature verification failed')
        }

        isLoggingIn.value = false
      }

      verifySignature()

      onInvalidate(() => {
        isLoggingIn.value = false
      })
    })
  } catch (error) {
    toast.danger(error as any)
    isLoggingIn.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <BaseButton
        @click="isConnected ? modal.open() : modal.open({ view: 'Connect' })"
        flavor="pastel"
        class="w-full"
        :disabled="isLoggingIn"
        :loading="isLoggingIn"
        :color="isConnected ? 'info' : 'warning'"
      >
        {{
          isConnected
            ? walletAddress?.slice(0, 8) + '...' + walletAddress?.slice(-6)
            : 'Connect Wallet'
        }}
      </BaseButton>
      <BaseButton
        v-if="isConnected"
        @click="modal.open({ view: 'Networks' })"
        color="primary"
        flavor="pastel"
        :disabled="isLoggingIn"
        :loading="isLoggingIn"
        data-nui-tooltip="Change Network"
      >
        {{ networkName }}
      </BaseButton>
      <BaseButton
        v-if="isConnected"
        @click="disconnect()"
        color="danger"
        flavor="pastel"
        :disabled="isLoggingIn"
        :loading="isLoggingIn"
        data-nui-tooltip="Disconnect Wallet"
      >
        <Icon name="line-md:close" class="w-4 h-4" />
      </BaseButton>
    </div>
    <BaseButton
      v-if="isConnected"
      @click="handleWalletLogin(walletAddress)"
      color="success"
      shape="curved"
      class="!h-11 w-full"
      :loading="isLoggingIn"
      :disabled="isLoggingIn"
    >
      <Icon name="simple-icons:walletconnect" class="w-4 h-4 mr-2" />
      Sign In With Wallet
    </BaseButton>
  </div>
</template>
