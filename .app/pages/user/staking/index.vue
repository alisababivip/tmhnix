<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useStakingPoolsStore } from '~~/store/extensions/staking/user/pools'
import { useEcosystemWalletStore } from '~~/store/extensions/ecosystem/wallets/user'
import type { User } from '~~/types'
definePageMeta({
  title: 'Staking',
})
const extensionStore = useExtensionStore()
const extensions = computed(() => extensionStore.extensionsUser)
const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)
const route = useRoute()
const stakingPoolStore = useStakingPoolsStore()
const pools = computed(() => stakingPoolStore.pools)
onMounted(async () => {
  if (stakingPoolStore.pools.length == 0) {
    await stakingPoolStore.fetchStakingPools()
  }
  if (pools.value.length > 0) {
    for (const pool of pools.value) {
      pool.selectedDuration = pool.durations[0]
    }
  }
  if (extensionStore.extensions.length === 0) {
    await extensionStore.fetchExtensionsUser()
  }
})

const walletStore = useWalletStore()
const ecosystemWalletStore = useEcosystemWalletStore()
const wallet = ref({})

const filter = ref('')
const perPage = ref(10)
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const items = computed(() =>
  stakingPoolStore.pools.filter(
    (item) => item.currency?.includes(filter.value),
  ),
)
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

// Validation
const zodSchema = z.object({
  amount: z.number().gt(0, 'Interest rate must be greater than 0'),
  duration: z.object({
    label: z.string(),
    value: z.number(),
  }),
})

type FormInput = z.infer<typeof zodSchema>

const initialValues = computed<FormInput>(() => ({
  amount: 0,
  duration: {
    label: 'Please select a duration',
    value: 0,
  },
}))
const { handleSubmit, isSubmitting, values, resetForm, setFieldError } =
  useForm({
    validationSchema: toTypedSchema(zodSchema),
    initialValues,
  })

// Stake
const isStakeOpen = ref(false)
const { toast } = useUtils()
const selectedPool = ref(null)
const { stakeTokens } = useStaking()
const stake = handleSubmit(async (values) => {
  const minStake = Number(selectedPool.value?.min_stake)
  const maxStake = Number(selectedPool.value?.max_stake)

  if (values.amount < minStake) {
    setFieldError(
      'amount',
      `Amount must be greater than minimum stake of ${minStake}`,
    )
    return
  }

  if (values.amount > maxStake) {
    setFieldError(
      'amount',
      `Amount must be less than maximum stake of ${maxStake}`,
    )
    return
  }

  if (values.amount > Number(wallet?.balance)) {
    setFieldError('amount', 'Insufficient balance')
    return
  }

  try {
    const response = (await stakeTokens(
      selectedPool.value?.id,
      values.amount,
      values.duration?.value,
    )) as any
    toast.response(response)
    if (response.status === 'success') {
      if (selectedPool.value?.type === 'SPOT') {
        await walletStore.fetchWallets()
        wallet.value = walletStore.wallets[selectedPool.value?.currency] ?? {}
      }
      if (extensions.value['ecosystem'] && selectedPool.value?.type === 'ECO') {
        await ecosystemWalletStore.fetchWallets(false, false)
        wallet.value =
          ecosystemWalletStore.wallets[selectedPool.value?.currency] ?? {}
      }
      resetForm()
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isStakeOpen.value = false
})

const openStake = async (pool) => {
  selectedPool.value = pool

  if (selectedPool.value?.type === 'SPOT') {
    await walletStore.fetchWallets()
    wallet.value = walletStore.wallets[selectedPool.value?.currency] ?? {}
  }
  if (extensions.value['ecosystem'] && selectedPool.value?.type === 'ECO') {
    await ecosystemWalletStore.fetchWallets(false, false)
    wallet.value =
      ecosystemWalletStore.wallets[selectedPool.value?.currency] ?? {}
  }
  isStakeOpen.value = true
}
</script>

<template>
  <div class="relative">
    <div
      class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-10"
    >
      <div
        class="relative w-[320px]"
        :class="{
          'h-[170px]': $viewport.isLessThan('sm'),
          'h-[175px]': $viewport.isGreaterOrEquals('sm'),
        }"
      >
        <LottieStakingBanner
          classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-12"
          height="320px"
          width="340px"
        />
      </div>
      <div class="mt-20 grow sm:mt-0">
        <div
          class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-xl"
        >
          <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
            <span>
              {{
                pools?.length > 0
                  ? $t('Stake your crypto and earn interest on it.')
                  : $t('No staking pools available.')
              }}
              <span class="text-3xl">📈</span>
            </span>
          </BaseHeading>
          <BaseParagraph size="sm" class="text-white opacity-70">
            <span>
              {{
                pools?.length > 0
                  ? $t(
                      'Staking is the process of holding funds in a cryptocurrency wallet to support the operations of a blockchain network. Users are rewarded for simply depositing and holding coins.',
                    )
                  : $t(
                      'There are no staking pools available at the moment. Please check back later.',
                    )
              }}
            </span>
          </BaseParagraph>
        </div>
      </div>
    </div>
    <div class="relative pt-2">
      <TairoContentWrapper>
        <template #left>
          <BaseInput
            v-model="filter"
            icon="lucide:search"
            placeholder="Filter pools currency..."
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
          />
        </template>
        <template #right>
          <BaseSelect
            v-model="perPage"
            placeholder="Items per page"
            label=""
            :classes="{
              wrapper: 'w-full sm:w-40',
            }"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </BaseSelect>
        </template>
        <div>
          <div v-if="paginatedItems.length === 0">
            <BasePlaceholderPage
              title="No matching results"
              subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
            >
              <template #image>
                <img
                  class="block dark:hidden"
                  src="/img/illustrations/placeholders/flat/placeholder-search-6.svg"
                  alt="Placeholder image"
                />
                <img
                  class="hidden dark:block"
                  src="/img/illustrations/placeholders/flat/placeholder-search-6-dark.svg"
                  alt="Placeholder image"
                />
              </template>
            </BasePlaceholderPage>
          </div>
          <div v-else>
            <TransitionGroup
              enter-active-class="transform-gpu"
              enter-from-class="opacity-0 -translate-x-full"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="absolute transform-gpu"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-full"
            >
              <BaseCard v-for="item in paginatedItems" :key="item.id">
                <div
                  class="border-muted-200 dark:border-muted-700 flex flex-col items-center border-b p-6 sm:flex-row"
                >
                  <div class="flex flex-col items-center gap-3 sm:flex-row">
                    <BaseAvatar
                      :badge-src="`/img/crypto/${item.chain}.png`"
                      :src="`/img/crypto/${item.currency.toLowerCase()}.png`"
                      :text="`${item.currency} (${item.name})`"
                      size="xl"
                      class="bg-muted-500/20 text-muted-500"
                    />
                    <div class="text-center leading-none sm:text-left">
                      <h4
                        class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
                      >
                        {{ item.currency }} ({{ item.name }})
                      </h4>
                      <p class="text-muted-400 font-sans text-sm">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex items-center gap-3 sm:ms-auto sm:mt-0">
                    <div
                      class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                    >
                      <div class="flex flex-col gap-1 px-4 text-center">
                        <BaseHeading
                          tag="h3"
                          size="md"
                          weight="semibold"
                          class="text-muted-800 dark:text-muted-100"
                        >
                          <span
                            >{{ item.min_stake + ' - ' + item.max_stake }}
                            {{ item.currency }}</span
                          >
                        </BaseHeading>
                        <BaseParagraph
                          lead="none"
                          weight="semibold"
                          class="text-muted-400 !text-[0.65rem] uppercase"
                        >
                          <span>Limits</span>
                        </BaseParagraph>
                      </div>
                      <div class="flex flex-col gap-1 px-4 text-center">
                        <BaseHeading
                          tag="h3"
                          size="md"
                          weight="semibold"
                          class="text-muted-800 dark:text-muted-100"
                        >
                          <span class="text-success-400 dark:text-success-300"
                            >{{ item.selectedDuration?.interest_rate }}%
                          </span>
                        </BaseHeading>
                        <BaseParagraph
                          lead="none"
                          weight="semibold"
                          class="text-muted-400 !text-[0.65rem] uppercase"
                        >
                          <span>Interest</span>
                        </BaseParagraph>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="flex flex-col items-center justify-between px-6 py-4 sm:flex-row"
                >
                  <div
                    class="w-full grow sm:w-auto sm:max-w-[260px] flex flex-wrap items-center gap-1"
                  >
                    <BaseTag
                      v-for="duration in item.durations"
                      :key="duration.id"
                      class="flex justify-between"
                      @click="item.selectedDuration = duration"
                      :color="
                        duration.id === item.selectedDuration?.id
                          ? 'primary'
                          : 'default'
                      "
                      shadow="hover"
                    >
                      <span
                        >{{ duration.duration }}
                        {{ duration.duration > 1 ? 'Days' : 'Day' }}</span
                      >
                    </BaseTag>
                  </div>
                  <div class="mt-4 w-full sm:mt-0 sm:w-auto">
                    <BaseButton
                      class="w-full sm:w-auto"
                      color="success"
                      @click="openStake(item)"
                    >
                      Stake
                    </BaseButton>
                  </div>
                </div>
              </BaseCard>
            </TransitionGroup>
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
    </div>

    <TairoModal :open="isStakeOpen" size="sm" @close="isStakeOpen = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Stake') }} {{ selectedPool?.currency }}
          </h3>

          <BaseButtonClose @click="isStakeOpen = false" />
        </div>
      </template>
      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-start">
          <div class="space-y-3">
            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="duration"
            >
              <BaseListbox
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                label="Duration"
                placeholder="Select a duration"
                :items="
                  selectedPool?.durations?.map((item) => ({
                    label: `${item.duration} ${
                      item.duration > 1 ? 'Days' : 'Day'
                    }`,
                    value: item.id,
                  })) ?? []
                "
                :properties="{
                  label: 'label',
                  value: 'value',
                }"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange, handleBlur }"
              name="amount"
            >
              <BaseInput
                v-model="field.value"
                :error="errorMessage"
                :disabled="isSubmitting"
                type="number"
                label="Amount"
                placeholder="Enter amount"
                :min="Number(selectedPool?.min_stake)"
                :max="Number(selectedPool?.max_stake)"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
            <span class="flex justify-between items-center text-xs">
              <span class="text-muted-800 dark:text-muted-200">{{
                $t('Balance')
              }}</span>
              <span
                class="text-muted-800 dark:text-muted-200 items-center flex gap-1"
              >
                {{ wallet?.balance ?? 0 }} {{ selectedPool?.currency
                }}<NuxtLink
                  :to="`/user/wallets/${selectedPool?.type?.toLowerCase()}/${selectedPool?.currency?.toLowerCase()}`"
                  data-nui-tooltip="Wallets"
                >
                  <Icon name="ei:plus" class="h-5 w-5 text-success-500" />
                </NuxtLink>
              </span>
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="isStakeOpen = false">{{
              $t('Cancel')
            }}</BaseButton>
            <BaseButton
              color="primary"
              flavor="solid"
              @click="stake"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              {{ $t('Stake') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
    <Faqs category="STAKING" />
  </div>
</template>
