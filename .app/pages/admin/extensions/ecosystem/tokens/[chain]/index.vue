<script setup lang="ts">
import { useEcosystemAdminTokenStore } from '~~/store/extensions/ecosystem/tokens/admin'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import { z } from 'zod'
import { useAccount, useConnect, useDisconnect } from 'use-wagmi'
import { InjectedConnector } from 'use-wagmi/connectors/injected'
import { getWalletClient } from '@wagmi/core'
import type { EcosystemToken } from '~~/types'
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl
const metamaskDeeplink = `https://metamask.app.link/dapp/${siteUrl.replace(
  /^https?:\/\//,
  '',
)}`

const { isConnected } = useAccount()
const { connect } = useConnect({
  connector: new InjectedConnector(),
})
const { disconnect } = useDisconnect()

definePageMeta({
  permissions: ['View Ecosystem Tokens'],
  title: 'Ecosystem Tokens',
})

const route = useRoute()
const { chain } = route.params

const ecosystemAdminTokenStore = useEcosystemAdminTokenStore()
const { updateAdminTokenIcon, updateTokenStatusBulk, updateAdminToken } =
  useEcosystem()

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const isEditingOpen = ref(false)
const isEditing = ref(false)

const tokensForChain = computed(() => {
  return ecosystemAdminTokenStore.tokens.filter(
    (token) => token.chain === chain,
  )
})
const items = computed(
  () =>
    // sort by status then alphabetically
    tokensForChain.value
      ?.filter((item) => item.currency.includes(filter.value))
      .sort((a, b) => {
        if (a.status === b.status) {
          return a.currency.localeCompare(b.currency)
        }
        return a.status ? -1 : 1
      }),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

onMounted(async () => {
  if (ecosystemAdminTokenStore.tokens.length === 0) {
    await ecosystemAdminTokenStore.fetchTokensAll()
  }
})

const { toast } = useUtils()
const activeToken: Ref<EcosystemToken | undefined> = ref(undefined)

const currentAvatar = computed(
  () => activeToken.value?.icon ?? '/img/crypto/eth.png',
)
const inputFile = ref<FileList | null>(activeToken.value?.icon || null)
watch(inputFile, (value) => {
  if (inputFile.value) {
    handleFileUpload()
  }
})
const handleFileUpload = async () => {
  const body = new FormData()
  body.append('files', inputFile.value[0])
  body.append('oldImagePath', activeToken.value?.icon)
  body.append('type', 'crypto')

  // Upload the file
  const uploadResponse = await useFetch('/api/upload', {
    method: 'POST',
    body,
  })

  // Check if the upload was successful and get the URL
  if (uploadResponse && uploadResponse.data.value !== '') {
    // Set the new image URL in the form values
    const image = uploadResponse.data.value[0]
    const response = await updateAdminTokenIcon(activeToken.value?.id, image)
    toast.response(response)
    if (response.status === 'success') {
      await ecosystemAdminTokenStore.fetchTokensAll()
    }
    isEditing.value = false
    isEditingOpen.value = false
  }
  isEditing.value = false
  isEditingOpen.value = false
}

const zodSchema = z.object({
  precision: z
    .number()
    .int()
    .positive('Precision must be a positive number')
    .max(8),
  limits: z.object({
    withdrawal: z.object({
      min: z.number().positive('Minimum withdrawal must be positive'),
      max: z.number().positive('Maximum withdrawal must be positive'),
    }),
  }),
  fees: z.object({
    withdrawal: z.number().positive('Withdrawal fee must be positive'),
    min_withdrawal: z
      .number()
      .positive('Minimum withdrawal fee must be positive'),
  }),
})

// Validation
type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  precision: 8,
  limits: {
    withdrawal: {
      min: 1,
      max: 1000,
    },
  },
  fees: {
    withdrawal: 0.01,
    min_withdrawal: 0.001,
  },
}))

const {
  handleSubmit: handleSubmit,
  isSubmitting: isSubmitting,
  resetForm: resetForm,
  setFieldValue: setFieldValue,
} = useForm({
  validationSchema: toTypedSchema(zodSchema),
  initialValues,
})

const openEditModel = (item: EcosystemToken) => {
  activeToken.value = item
  if (item) {
    setFieldValue('fees.withdrawal', item.fees?.withdrawal)
    setFieldValue('fees.min_withdrawal', item.fees?.min_withdrawal)
    setFieldValue('limits.withdrawal.min', item.limits?.withdrawal?.min)
    setFieldValue('limits.withdrawal.max', item.limits?.withdrawal?.max)
    setFieldValue('precision', item.precision)
    isEditingOpen.value = true
  }
}

const update = handleSubmit(async (values) => {
  isSubmitting.value = true
  const { precision, limits, fees } = values
  const response = await updateAdminToken(
    activeToken.value?.id,
    precision,
    limits,
    fees,
  )
  toast.response(response)
  if (response.status === 'success') {
    await ecosystemAdminTokenStore.fetchTokensAll()
    isEditingOpen.value = false
    resetForm()
  }
  isSubmitting.value = false
})

// Selection
const selected = ref<number[]>([])
const isAllVisibleSelected = computed(() => {
  return selected.value.length === items.value.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  } else {
    selected.value = items.value.map((item) => item.id) ?? []
  }
}

async function updateSelectedCurrenciesStatus(status) {
  const response = await updateTokenStatusBulk(selected.value, status)
  toast.response(response as any)
  if (response.status === 'success') {
    await ecosystemAdminTokenStore.fetchTokensAll()
  }
  selected.value = []
}

const addToMetamask = async (item) => {
  if (typeof window.ethereum === 'undefined') {
    toast.dangerText('Ethereum support is not found, please install MetaMask')
    setTimeout(() => {
      window.open(metamaskDeeplink, '_blank')
    }, 1000)
    return
  }

  if (!window.ethereum.isMetaMask) {
    toast.dangerText('MetaMask is not available, please install it')
    setTimeout(() => {
      window.open(metamaskDeeplink, '_blank')
    }, 1000)
    return
  }

  if (!isConnected) {
    toast.dangerText('Please connect your wallet first')
    connect()
    return
  }

  let walletClient
  try {
    walletClient = await getWalletClient()
  } catch (error) {
    toast.danger(error as any)
  }

  if (!walletClient) {
    toast.dangerText('Wallet client is not available')
    return
  }

  const options = {
    address: item.contract,
    symbol: item.currency,
    decimals: item.decimals,
  } as any

  // Check if the token has an icon and add it to the options
  if (item.icon) {
    options.image = `${siteUrl}${item.icon}`
  }

  try {
    await walletClient.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: options,
      },
    })
    toast.successText('Token added to Metamask successfully')
  } catch (error) {
    toast.dangerText(
      error.message.includes('User rejected the request')
        ? 'User rejected the request'
        : error.message,
    )
  }
}
const isValidFile = (file: any) => file instanceof File || file instanceof Blob

const utxoChains = ['BTC', 'LTC', 'DOGE', 'DASH']
</script>

<template>
  <div>
    <div class="justify-between flex gap-3 pb-3 items-center">
      <div class="text-lg font-semibold">{{ chain }} Tokens</div>
      <div class="justify-between flex gap-3">
        <template v-if="!utxoChains.includes(chain)">
          <BaseButton
            v-if="isConnected"
            @click="disconnect"
            color="danger"
            flavor="pastel"
          >
            <Icon name="logos:metamask-icon" class="me-2 h-5 w-5" />
            Disconnect
          </BaseButton>
          <BaseButton v-else @click="connect" color="info" flavor="pastel">
            <Icon name="logos:metamask-icon" class="me-2 h-5 w-5" />
            Connect Wallet
          </BaseButton>
          <BaseButton
            color="primary"
            :to="`/admin/extensions/ecosystem/tokens/${chain}/create`"
          >
            <Icon name="lucide:plus" size="16" class="mr-2" />
            {{ $t('Create Token') }}</BaseButton
          >
          <BaseButton
            color="warning"
            :to="`/admin/extensions/ecosystem/tokens/${chain}/import`"
          >
            <Icon name="lucide:plus" size="16" class="mr-2" />
            {{ $t('Import') }}</BaseButton
          ></template
        >
        <BaseButton
          :to="`/admin/extensions/ecosystem/blockchains/wallets`"
          color="muted"
          flavor="pastel"
        >
          <Icon name="line-md:chevron-left" class="me-2 h-4 w-4" />
          Back
        </BaseButton>
      </div>
    </div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          placeholder="Filter tokens..."
        />
      </template>
      <template #right>
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
      <div>
        <template
          v-if="
            !ecosystemAdminTokenStore.loading && paginatedItems?.length === 0
          "
        >
          <BasePlaceholderPage
            :title="
              filter && filter !== '' ? 'No matching results' : 'No results'
            "
            :subtitle="
              filter && filter !== ''
                ? 'Looks like we couldn\'t find any matching results for your search terms. Try other search terms.'
                : 'Looks like we don\'t have any data here yet.'
            "
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
        <div v-else class="w-full">
          <div
            class="bg-info-100 text-info-700 dark:bg-info-700 dark:text-info-100 rounded-lg p-4 flex justify-between items-center w-full mb-5"
            v-if="!ecosystemAdminTokenStore.loading && selected.length > 0"
          >
            <span class="text-sm">
              {{ $t('You have selected') }} {{ selected.length }}
              {{ $t('items of the total') }} {{ items.length }}
              {{ $t('items') }}.
            </span>
            <div class="flex gap-2">
              <TairoButtonIcon
                color="danger"
                size="xs"
                data-nui-tooltip="Disable currencies"
                @click="() => updateSelectedCurrenciesStatus(false)"
              >
                <Icon name="line-md:close-small" class="h-5 w-5" />
              </TairoButtonIcon>
              <TairoButtonIcon
                color="success"
                size="xs"
                data-nui-tooltip="Enable currencies"
                @click="() => updateSelectedCurrenciesStatus(true)"
              >
                <Icon name="line-md:confirm" class="h-5 w-5" />
              </TairoButtonIcon>
            </div>
          </div>
          <TairoFlexTable class="md:pt-0 sm:pt-5 md:mt-0 sm:mt-5">
            <template #header>
              <div class="relative">
                <span class="pl-4">
                  <BaseCheckbox
                    :model-value="isAllVisibleSelected"
                    :indeterminate="
                      selected.length > 0 && !isAllVisibleSelected
                    "
                    name="table-1-main"
                    shape="rounded"
                    class="text-primary-500"
                    @click="toggleAllVisibleSelection"
                  />
                </span>
              </div>
            </template>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transform-gpu"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <TableFlexTableRow
                v-for="(item, index) in paginatedItems"
                :key="item.id"
                spaced
              >
                <template #start>
                  <TableFlexTableCell
                    data-content="Selection"
                    class="xs:absolute right-2 ml-2"
                  >
                    <BaseCheckbox
                      v-model="selected"
                      :value="item.id"
                      :name="`item-checkbox-${item.id}`"
                      shape="rounded"
                      class="text-primary-500"
                    />
                  </TableFlexTableCell>
                  <TableFlexTableStart
                    label="Chain"
                    :hide-label="index > 0"
                    :title="`${item.name} (${item.currency})`"
                    :subtitle="item.contract"
                    :avatar="`${
                      item.icon ??
                      `/img/crypto/${item.currency.toLowerCase()}.png`
                    }`"
                  />
                </template>
                <template #end>
                  <TableFlexTableStart
                    label="Chain"
                    :hide-label="index > 0"
                    :title="item.chain"
                    :subtitle="item.network"
                  />
                  <TableFlexTableCell
                    label="Decimals"
                    :hide-label="index > 0"
                    class="w-20 xs:w-full"
                  >
                    {{ item.decimals }}
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
                        :to="`/admin/extensions/ecosystem/tokens/${item.chain}/${item.currency}/holders`"
                        title="View Token Holders"
                        v-if="item.contractType !== 'NATIVE'"
                      >
                        <template #start>
                          <Icon name="mdi:eye" class="me-2 block h-5 w-5" />
                        </template>
                      </BaseDropdownItem>
                      <BaseDropdownItem
                        @click="openEditModel(item)"
                        title="Edit Token"
                      >
                        <template #start>
                          <Icon
                            name="line-md:pencil"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>
                      <BaseDropdownItem
                        @click="addToMetamask(item)"
                        title="Add to Metamask"
                        v-if="item.contractType !== 'NATIVE'"
                      >
                        <template #start>
                          <Icon
                            name="logos:metamask-icon"
                            class="me-2 block h-5 w-5"
                          />
                        </template>
                      </BaseDropdownItem>
                    </BaseDropdown>
                  </TableFlexTableCell>
                </template>
              </TableFlexTableRow>
            </TransitionGroup>
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

    <TairoModal :open="isEditingOpen" size="xl" @close="isEditingOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Editing') }}
            {{ activeToken?.currency }}
            {{ $t('Token') }}
          </h3>

          <BaseButtonClose @click="isEditingOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <div class="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div class="col-span-2 flex justify-center pb-3">
              <BaseInputFileHeadless
                accept="image/*"
                type="file"
                v-model="inputFile"
                v-slot="{ open, remove, preview, files }"
                name="image"
              >
                <div class="relative h-20 w-20">
                  <img
                    v-if="files?.length && isValidFile(files[0])"
                    :src="preview(files.item(0)!).value"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center"
                  />
                  <img
                    v-else
                    :src="currentAvatar"
                    alt="Upload preview"
                    class="bg-muted-200 dark:bg-muted-700/60 h-20 w-20 rounded-full object-cover object-center dark:invert"
                  />
                  <div
                    v-if="files?.length && isValidFile(files[0])"
                    class="absolute bottom-0 end-0 z-20"
                  >
                    <BaseButtonIcon
                      condensed
                      shape="full"
                      @click="remove(files.item(0)!)"
                      data-nui-tooltip="Remove image"
                      class="scale-90"
                    >
                      <Icon name="lucide:x" class="h-4 w-4" />
                    </BaseButtonIcon>
                  </div>
                  <div v-else class="absolute bottom-0 end-0 z-20">
                    <div class="relative" data-nui-tooltip="Upload image">
                      <BaseButtonIcon condensed shape="full" @click="open">
                        <Icon name="lucide:plus" class="h-4 w-4" />
                      </BaseButtonIcon>
                    </div>
                  </div>
                </div>
              </BaseInputFileHeadless>
            </div>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="limits.withdrawal.min"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Minimum Withdrawal Amount"
                placeholder="Enter minimum withdrawal amount"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="limits.withdrawal.max"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Maximum Withdrawal Amount"
                placeholder="Optional maximum withdrawal amount"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="fees.withdrawal"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Withdrawal Fee"
                placeholder="Enter withdrawal fee"
                icon="iconoir:percentage"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="fees.min_withdrawal"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Minimum Withdrawal Fee (Fixed)"
                placeholder="Enter minimum withdrawal fee if amount is too low"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="precision"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Precision"
                placeholder="Enter decimal precision"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isEditingOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="update()"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Edit Token') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
