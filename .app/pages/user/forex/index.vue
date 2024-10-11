<script setup lang="ts">
import { useForexAccountStore } from '~~/store/extensions/forex/account'
import type { User } from '~~/types'
definePageMeta({
  title: 'Forex Accounts',
})
const userStore = useUserStore()
const user = computed(() => userStore.getProfile as User)
const forexAccountStore = useForexAccountStore()
const accounts = computed(() => forexAccountStore.accounts)
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
onMounted(async () => {
  await forexAccountStore.fetchAccounts()
})
</script>

<template>
  <div class="relative">
    <!-- Header -->
    <div
      v-if="settings?.forex_investment"
      class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-10"
    >
      <div
        class="relative w-[320px]"
        :class="{
          'h-[170px]': $viewport.isLessThan('sm'),
          'h-[175px]': $viewport.isGreaterOrEquals('sm'),
        }"
      >
        <LottieForex
          classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8"
          height="280px"
        />
      </div>
      <div class="mt-24 grow sm:mt-0">
        <div
          class="pb-4 text-center sm:pb-0 sm:text-left max-w-xs md:max-w-md lg:max-w-2xl"
        >
          <BaseHeading tag="h1" class="mb-2 text-white opacity-90">
            <span>
              {{ $t('Boost Your Earnings With Forex Trading') }}
              <span class="text-3xl">📈</span>
            </span>
          </BaseHeading>
          <BaseParagraph size="sm" class="text-white opacity-70">
            <span>
              {{
                $t(
                  'Our Investment plans will help you to boost your earnings with forex trading.',
                )
              }}
            </span>
          </BaseParagraph>
          <div class="mt-2">
            <NuxtLink to="/user/forex/invest">
              <BaseButton
                size="sm"
                color="light"
                flavor="outline"
                class="w-full sm:w-auto"
              >
                <span>{{ $t('Explore Plans') }}</span>
                <Icon name="lucide:arrow-right" class="h-4 w-4" />
              </BaseButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div
      class="mb-8 flex flex-col justify-between md:flex-row md:items-center"
      v-else
    >
      <div
        class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
      >
        <BaseAvatar src="/img/avatars/2.svg" size="lg" />
        <div>
          <BaseHeading
            as="h2"
            size="xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>Welcome back, {{ user.first_name }}</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              Here you can view your recent activity and statistics.
            </span>
          </BaseParagraph>
        </div>
      </div>
    </div>
    <div v-if="!accounts?.DEMO?.status || !accounts?.LIVE?.status">
      <BasePlaceholderPage
        class="w-full"
        title="Your Forex Account is not ready yet"
        subtitle="Please wait until your account is verified"
      >
        <template #image>
          <LottieBlockchain1 />
        </template>
      </BasePlaceholderPage>
    </div>
    <template v-else>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BaseCard
          v-for="(account, index) in accounts"
          :key="index"
          class="p-5"
          shape="curved"
          elevated-hover
        >
          <div class="mb-5">
            <NuxtLink :to="`/user/forex/${account?.account_id}`">
              <BaseButton
                color="success"
                class="w-full"
                :disabled="!account?.status || account?.balance === 0"
              >
                <span>{{ account?.type }} Trade</span>
              </BaseButton>
            </NuxtLink>
          </div>
          <div class="flex justify-between items-center">
            <span>Account ID</span>
            <span>{{ account?.account_id }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Password</span>
            <span class="flex items-center gap-2"
              ><span
                :class="{
                  'h-4': !forexAccountStore.accounts[index]?.passwordUnlocked,
                }"
                >{{
                  !forexAccountStore.accounts[index]?.passwordUnlocked
                    ? '*********'
                    : account?.password
                }}</span
              >
              <Icon
                :name="
                  !forexAccountStore.accounts[index]?.passwordUnlocked
                    ? 'mdi:eye-off'
                    : 'mdi:eye'
                "
                :class="
                  !forexAccountStore.accounts[index]?.passwordUnlocked
                    ? 'text-muted-500'
                    : 'text-primary-500'
                "
                class="cursor-pointer"
                @click="
                  forexAccountStore.accounts[index].passwordUnlocked =
                    !forexAccountStore.accounts[index].passwordUnlocked
                "
              />
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span>Leverage</span>
            <span>x{{ account?.leverage }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>MetaTrader</span>
            <span>{{ account?.mt }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Balance</span>
            <span>{{ account?.balance }}</span>
          </div>
          <div
            class="flex gap-5 items-center justify-center mt-5"
            v-if="account?.type === 'LIVE'"
          >
            <NuxtLink
              :to="`/user/forex/${account?.account_id}/deposit`"
              class="w-full"
            >
              <BaseButton
                color="primary"
                class="w-full"
                :disabled="!account?.status"
              >
                <span>Deposit</span>
              </BaseButton>
            </NuxtLink>
            <NuxtLink
              :to="`/user/forex/${account?.account_id}/withdraw`"
              class="w-full"
            >
              <BaseButton
                color="danger"
                class="w-full"
                :disabled="!account?.status || account?.balance === 0"
              >
                <span>Withdraw</span>
              </BaseButton>
            </NuxtLink>
          </div>
        </BaseCard>
      </div>
    </template>
    <Faqs category="FOREX" />
  </div>
</template>
