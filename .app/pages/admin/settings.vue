<script setup lang="ts">
definePageMeta({
  title: 'Settings',
  permissions: ['Access Settings'],
})
import type { User } from '~~/types'
const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
</script>

<template>
  <div class="overflow-hidden">
    <div class="grid gap-8 grid-cols-1 sm:grid-cols-12">
      <div class="col-span-1 sm:col-span-3">
        <div class="flex w-full items-center gap-2">
          <BaseAvatar :src="user?.avatar" size="md" />
          <div class="">
            <BaseHeading tag="h2" size="md" weight="medium" lead="none">
              {{ user?.first_name }}
            </BaseHeading>
            <BaseParagraph size="xs" class="mt-2">
              <BaseTag shape="rounded" color="primary" condensed>{{
                user?.role.name
              }}</BaseTag>
            </BaseParagraph>
          </div>
        </div>
        <div class="mt-8 max-w-[240px]">
          <ul class="space-y-1 font-sans text-sm">
            <li>
              <NuxtLink
                to="/admin/settings"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>{{ $t('General Settings') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/theme"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="gridicons:layout" class="h-4 w-4" />
                <span>{{ $t('Theme') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/wallets"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="solar:wallet-money-bold-duotone" class="h-4 w-4" />
                <span>{{ $t('Wallets') }}</span>
              </NuxtLink>
            </li>
            <li v-if="settings?.frontend_type === 'Basic'">
              <NuxtLink
                to="/admin/settings/frontend"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="line-md:image-twotone" class="h-4 w-4" />
                <span>{{ $t('Frontend Sections') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/logo"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>{{ $t('Logo') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/locales"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="fluent-mdl2:locale-language" class="h-4 w-4" />
                <span>{{ $t('Locale') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/kyc"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon
                  name="streamline:interface-security-shield-profileshield-secure-security-profile-person"
                  class="h-4 w-4"
                />
                <span>{{ $t('KYC') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/notification"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="tabler:mail-cog" class="h-4 w-4" />
                <span>{{ $t('Notifications') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/pages"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="iconoir:page" class="h-4 w-4" />
                <span>{{ $t('Custom Pages') }}</span>
              </NuxtLink>
            </li>
            <li v-if="settings?.spot_exchange && settings?.binary_trading">
              <NuxtLink
                to="/admin/settings/binary-trading"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:trend-up-thin" class="h-4 w-4" />
                <span>{{ $t('Binary Trading') }}</span>
              </NuxtLink>
            </li>
            <li v-if="settings?.spot_exchange">
              <NuxtLink
                to="/admin/settings/exchange"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="icon-park-outline:exchange-one" class="h-4 w-4" />
                <span>{{ $t('Exchange Provider') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/settings/fiat-currencies"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="fa:usd" class="h-4 w-4" />
                <span>{{ $t('Fiat Currencies') }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-span-1 sm:col-span-9">
        <RouterView v-slot="{ Component }">
          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="translate-y-20 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-20 opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>
