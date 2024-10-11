<script setup lang="ts">
import { useEcosystemMasterWalletStore } from '~~/store/extensions/ecosystem/wallets/admin'

definePageMeta({
  permissions: ['View Ecosystem Master Wallets'],
  title: 'Ecosystem Master Wallets',
})

const ecosystemMasterWalletStore = useEcosystemMasterWalletStore()
const {
  createMasterWallet,
  setEcosystemPassphrase,
  fetchMasterWalletsBalance,
} = useEcosystem()
const route = useRoute()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const loading = ref(false)

const items = computed(() =>
  ecosystemMasterWalletStore.wallets.filter((item) =>
    item.chain.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (ecosystemMasterWalletStore.wallets.length === 0) {
    await ecosystemMasterWalletStore.fetchWallets()
  }
  loading.value = true
  const response = await fetchMasterWalletsBalance()
  if (response.status === 'success') {
    ecosystemMasterWalletStore.setWallets(response.data.result)
  }
  loading.value = false
})
const { toast } = useUtils()

const isSubmitting = ref(false)
const isCreateOpen = ref(false)
const isPassPhraseModelOpen = ref(false)
const passphrase = ref('')
const selectedChain = ref(null)
const supportedChains = [
  'ETH',
  'BSC',
  'POLYGON',
  'FTM',
  // 'HECO',
  'OPTIMISM',
  'ARBITRUM',
  'BASE',
  // 'CRONOS',
  'CELO',
  'BTC',
  'LTC',
  'DOGE',
  'DASH',
]
async function createWallet() {
  isSubmitting.value = true
  try {
    if (!selectedChain.value) throw new Error('Please select a chain')
    const response = await createMasterWallet(selectedChain.value)
    toast.response(response)
    if (response.status === 'success') {
      await ecosystemMasterWalletStore.fetchWallets()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isSubmitting.value = false
  isCreateOpen.value = false
  selectedChain.value = null
}
async function setPassphrase() {
  isSubmitting.value = true
  try {
    const response = await setEcosystemPassphrase(passphrase.value)
    toast.response(response)
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
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter chain..."
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
        <BaseButton color="primary" @click="isCreateOpen = true">
          <Icon name="lucide:plus" size="16" class="mr-2" />
          {{ $t('Create Wallet') }}</BaseButton
        >
      </template>
      <div>
        <template
          v-if="
            !ecosystemMasterWalletStore.loading && paginatedItems?.length === 0
          "
        >
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
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
              v-for="(item, index) in paginatedItems"
              :key="item.id"
              spaced
            >
              <template #start>
                <TableFlexTableStart
                  label="Chain"
                  :hide-label="index > 0"
                  :title="`${item.currency} (${item.chain})`"
                  :subtitle="item.address"
                  :avatar="`/img/crypto/${item.currency.toLowerCase()}.png`"
                />
              </template>
              <template #end>
                <TableFlexTableCell
                  label="Balance"
                  :hide-label="index > 0"
                  class="w-40 xs:w-full text-sm"
                  :loading="loading"
                >
                  {{ item.balance.toFixed(8) }}
                </TableFlexTableCell>
                <TableFlexTableCell
                  label="Status"
                  :hide-label="index > 0"
                  class="w-20 xs:w-full"
                >
                  <BaseTag
                    :color="item.status ? 'success' : 'danger'"
                    flavor="pastel"
                    condensed
                    >{{ item.status ? 'Active' : 'Disabled' }}</BaseTag
                  >
                </TableFlexTableCell>
                <TableFlexTableCell label="Actions" :hide-label="index > 0">
                  <BaseDropdown
                    flavor="context"
                    label="Dropdown"
                    orientation="end"
                  >
                    <BaseDropdownItem
                      v-if="!utxoChains.includes(item.chain)"
                      :to="`/admin/extensions/ecosystem/blockchains/custodial/${item.chain}`"
                      title="Custodial Wallet"
                      text="For tokens without permit"
                    >
                      <template #start>
                        <Icon
                          name="solar:wallet-money-line-duotone"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      :to="`/admin/extensions/ecosystem/blockchains/wallets/${item.uuid}`"
                      title="Transactions"
                      text="Blockchain transactions"
                    >
                      <template #start>
                        <Icon
                          name="grommet-icons:transaction"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      :to="`/admin/extensions/ecosystem/tokens/${item.chain}`"
                      title="Tokens"
                      text="Tokens management"
                    >
                      <template #start>
                        <Icon
                          name="ic:twotone-generating-tokens"
                          class="me-2 block h-5 w-5"
                        />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                </TableFlexTableCell>
              </template>
            </TableFlexTableRow>
          </TairoFlexTable>
        </div>

        <div class="mt-6">
          <BasePagination
            v-if="items.length > perPage"
            :total-items="items.length"
            :current-page="page"
            :item-per-page="perPage"
          />
        </div>
      </div>
    </TairoContentWrapper>
    <TairoModal :open="isCreateOpen" size="sm" @close="isCreateOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Create New Wallet') }}
          </h3>

          <BaseButtonClose @click="isCreateOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <p
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            {{ $t('Please select the chain of the new master wallet') }}.
          </p>

          <BaseListbox
            v-model="selectedChain"
            :disabled="isSubmitting"
            :items="supportedChains"
            label="Chain"
            placeholder="Select a chain"
            shape="curved"
            :classes="{ input: 'h-12', wrapper: 'max-w-xs' }"
          />
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isCreateOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="createWallet()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Create') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
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
