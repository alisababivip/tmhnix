<script setup lang="ts">
import type { EcosystemMasterWallet, Transaction } from '~~/types'

definePageMeta({
  permissions: ['View Ecosystem Master Wallets'],
  title: 'Ecosystem Master Wallet Transactions',
})

const { getMasterWalletById, getMasterWalletTransactions } = useEcosystem()
const route = useRoute()
const uuid = route.params.uuid as string
const wallet = ref<EcosystemMasterWallet>()
const transactions = ref<Transaction[]>([])

const loading = ref(false)

onMounted(async () => {
  const response = await getMasterWalletById(uuid)
  if (response.status === 'success') {
    wallet.value = response.data.result
  }
  await getTransactions()
})

async function getTransactions() {
  loading.value = true
  const response = await getMasterWalletTransactions(
    wallet.value?.chain,
    wallet.value?.address,
  )
  if (response.status === 'success') {
    transactions.value = response.data.result
  }
  loading.value = false
}

const timestampToFullDate = (timestamp) => {
  const dtObject = new Date(timestamp * 1000) // Convert to milliseconds
  return dtObject.toLocaleString() // Convert to full date string
}

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  transactions.value.filter((item) => item.hash.includes(filter.value)),
)
const paginatedTransactions = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const commonMethodNames: any = {
  '0xa9059cbb': 'Transfer',
  '0x23b872dd': 'TransferFrom',
  '0x095ea7b3': 'Approve',
  '0x40c10f19': 'Mint',
  '0x414d0b80': 'Lock',
  '0x6f485ce2': 'Transfer',
  '0x': 'Transfer',
  '0xd505accf': 'Permit',
  '0x60806040': 'Contract Deployment',
  '0x61018060': 'Token Deployment',
}

const getMethodNameFromId = (methodId) => {
  return commonMethodNames[methodId] || methodId
}

// Define the essential chain information
const essentialChainInfo: any = {
  ETH: { decimals: 18, name: 'Ethereum', gasCurrency: 'Gwei' },
  BSC: { decimals: 18, name: 'Binance Smart Chain', gasCurrency: 'Gwei' },
  POLYGON: { decimals: 18, name: 'Polygon', gasCurrency: 'Gwei' },
  FTM: { decimals: 18, name: 'Fantom', gasCurrency: 'Gwei' },
  OPTIMISM: { decimals: 18, name: 'Optimism', gasCurrency: 'Gwei' },
  ARBITRUM: { decimals: 18, name: 'Arbitrum', gasCurrency: 'Gwei' },
  BASE: { decimals: 18, name: 'Base', gasCurrency: 'Gwei' },
  CELO: { decimals: 18, name: 'Celo', gasCurrency: 'Gwei' },
  TRON: { decimals: 6, name: 'Tron', gasCurrency: 'Gwei' },
  RSK: { decimals: 18, name: 'RSK', gasCurrency: 'Gwei' },
  HECO: { decimals: 18, name: 'Huobi ECO Chain', gasCurrency: 'Gwei' },
  CRONOS: { decimals: 18, name: 'Cronos', gasCurrency: 'Gwei' },
  BTC: { decimals: 8, name: 'Bitcoin', gasCurrency: 'satoshi' },
  LTC: { decimals: 8, name: 'Litecoin', gasCurrency: 'base' },
  DOGE: { decimals: 8, name: 'Dogecoin', gasCurrency: 'koinus' },
  DASH: { decimals: 8, name: 'Dash', gasCurrency: 'duff' },
}

const chainDecimals = computed(() => {
  return essentialChainInfo[wallet.value?.chain]?.decimals || 18
})

const chainName = computed(() => {
  return essentialChainInfo[wallet.value?.chain]?.name || 18
})

const chainGasCurrency = computed(() => {
  return essentialChainInfo[wallet.value?.chain]?.gasCurrency || 18
})

const formatAmount = (amount: number) => {
  const decimals = chainDecimals.value || 18
  let formattedAmount = amount / 10 ** decimals

  // Round to 'decimals' places
  formattedAmount = parseFloat(formattedAmount.toFixed(decimals))

  // Remove trailing zeros after the decimal point
  let strAmount = formattedAmount.toString()
  if (strAmount.indexOf('.') > 0) {
    strAmount = strAmount.replace(/0+$/, '')
    strAmount = strAmount.replace(/\.$/, '')
  }

  return Number(strAmount)
}

function standardUnitToSatoshi(amount, chain) {
  const conversionFactor = getConversionFactor(chain)
  return Math.round(amount * conversionFactor)
}

function satoshiToStandardUnit(satoshi, chain) {
  const conversionFactor = getConversionFactor(chain)
  return satoshi / conversionFactor // This can be a floating-point number
}

function getConversionFactor(chain) {
  return {
    BTC: 100000000, // For Bitcoin
    LTC: 100000000, // For Litecoin
    DOGE: 100000000, // For Dogecoin (adjust if different)
  }[chain]
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter transaction hash..."
        />
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">10 {{ $t('per page') }}</option>
          <option :value="25">25 {{ $t('per page') }}</option>
          <option :value="50">50 {{ $t('per page') }}</option>
          <option :value="100">100 {{ $t('per page') }}</option>
        </BaseSelect>
      </template>
      <template #right>
        <BaseButton
          color="muted"
          :to="`/admin/extensions/ecosystem/blockchains/wallets`"
          class="ms-2"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2" />
          {{ $t('Back') }}</BaseButton
        >
      </template>
      <!-- Wallet Details -->
      <BaseCard class="p-4">
        <div class="flex justify-start gap-5 items-center">
          <img
            :src="`/img/crypto/${wallet?.currency.toLowerCase()}.png`"
            alt="Wallet"
            class="w-18 h-16 rounded-full"
          />
          <div>
            <p>
              <strong> {{ chainName }}</strong>
            </p>
            <p><strong>Address:</strong> {{ wallet?.address }}</p>
            <p>
              <strong>Balance:</strong> {{ wallet?.balance }}
              {{ wallet?.currency }}
            </p>
          </div>
        </div>
      </BaseCard>

      <!-- Transactions -->

      <div class="mt-6">
        <template v-if="!loading && paginatedTransactions?.length === 0">
          <BasePlaceholderPage
            title="No Transactions Found"
            subtitle="Looks like we couldn't find any transactions for this wallet."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              />
            </template>
          </BasePlaceholderPage>
        </template>
        <div v-else class="w-full sm:pt-5">
          <TairoFlexTable>
            <TableFlexTableRow
              v-if="['BTC', 'LTC', 'DOGE', 'DASH'].includes(wallet?.chain)"
              v-for="(item, index) in paginatedTransactions"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Hash"
                  :hide-label="index > 0"
                  :title="item.hash"
                  :subtitle="`Block: ${item.blockHeight}`"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full text-xs"
                >
                  {{ satoshiToStandardUnit(item.value, wallet?.chain) }}
                </TableFlexTableCell>
                <TableFlexTableStart
                  label="Confirmations"
                  :hide-label="index > 0"
                  :title="item.confirmations"
                  :subtitle="formatDate(item.confirmedTime)"
                />
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="!item.spent ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{ !item.spent ? 'Unspent' : 'Spent' }}</BaseTag
                  >
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
            <TableFlexTableRow
              v-else
              v-for="(item, index) in paginatedTransactions"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Method"
                  :hide-label="index > 0"
                  :title="getMethodNameFromId(item.methodId)"
                  :subtitle="timestampToFullDate(item.timestamp)"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Target"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="
                      getMethodNameFromId(item.methodId) === 'Transfer'
                        ? item.to &&
                          item.to.toLowerCase() ===
                            wallet?.address.toLowerCase()
                          ? 'info'
                          : 'warning'
                        : 'warning'
                    "
                    flavor="pastel"
                    condensed
                    >{{
                      getMethodNameFromId(item.methodId) === 'Transfer'
                        ? item.to &&
                          item.to.toLowerCase() ===
                            wallet?.address.toLowerCase()
                          ? 'In'
                          : 'Out'
                        : 'Out'
                    }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableStart
                  label="Transfer"
                  :hide-label="index > 0"
                  :title="`From: ${item.from}`"
                  :subtitle="`To: ${
                    item.to !== null && item.to !== '' ? item.to : item.contract
                  }`"
                />
                <TableFlexTableCell
                  label="Amount"
                  :hide-label="index > 0"
                  class="w-40 xs:w-full"
                >
                  {{ formatAmount(item.amount) }}
                  {{ wallet?.currency }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="Number(item.status) === 1 ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{
                      Number(item.status) === 1 ? 'Success' : 'Failed'
                    }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Details"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <TairoButtonIcon
                    :color="item.showDetails ? 'warning' : 'muted'"
                    flavor="pastel"
                    @click="item.showDetails = !item.showDetails"
                    condensed
                  >
                    <Icon
                      :name="
                        item.showDetails ? 'line-md:chevron-up' : 'mdi:eye'
                      "
                      class="h-5 w-5"
                    />
                  </TairoButtonIcon>
                </TableFlexTableCell>
              </template>

              <template #details v-if="item.showDetails">
                <div class="px-2 pt-5">
                  <p><strong>Hash:</strong> {{ item.hash }}</p>
                  <p v-if="item.method !== null && item.method !== ''">
                    <strong>Method:</strong> {{ item.method }}
                  </p>
                  <p v-if="item.contract !== null && item.contract !== ''">
                    <strong>Contract:</strong> {{ item.contract }}
                  </p>
                  <p>
                    <strong>Confirmations:</strong>
                    {{ item.confirmations }}
                  </p>
                  <p>
                    <strong>Gas Price:</strong>
                    {{ formatAmount(item.gasPrice) }}
                    {{ chainGasCurrency }}
                  </p>
                  <p><strong>Gas Supplied:</strong> {{ item.gas }}</p>
                  <p><strong>Gas Used:</strong> {{ item.gasUsed }}</p>
                  <p>
                    <strong>Transaction Fee:</strong>
                    {{ formatAmount(item.gasUsed * item.gasPrice) }}
                    {{ wallet?.currency }}
                  </p>
                </div>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :current-page="page"
            :total-items="items.length"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>

<style scoped>
/* Add any additional scoped styles here */
</style>
