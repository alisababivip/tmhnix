<script setup lang="ts">
definePageMeta({
  title: 'Edit Profile',
})
import type { User } from '~~/types'
const userStore = useUserStore()
const user = userStore.getProfile as User

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="grid gap-8 grid-cols-1 sm:grid-cols-12">
      <div class="col-span-1 sm:col-span-3">
        <div class="space-y-5">
          <div class="flex w-full items-center gap-2">
            <BaseAvatar :src="user?.avatar ?? '/img/avatars/1.svg'" size="md" />
            <div class="">
              <BaseHeading tag="h2" size="md" weight="medium" lead="none">
                {{ user?.first_name }}
                {{ user?.last_name }}
              </BaseHeading>
              <BaseParagraph size="xs" class="mt-2">
                <BaseTag shape="rounded" color="primary" condensed>{{
                  user?.role.name
                }}</BaseTag>
              </BaseParagraph>
            </div>
          </div>
          <div class="text-xs">
            <div>UUID:</div>
            <div>{{ user?.uuid }}</div>
          </div>
        </div>
        <div class="mt-8 max-w-[240px]">
          <ul class="space-y-1 font-sans text-sm">
            <li>
              <NuxtLink
                to="/user/profile-edit"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:user-duotone" class="h-4 w-4" />
                <span>{{ $t('Profile') }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/user/profile-edit/security"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>{{ $t('Security') }}</span>
              </NuxtLink>
            </li>
            <li v-if="settings?.two_factor">
              <NuxtLink
                to="/user/profile-edit/two-factor"
                exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
              >
                <Icon name="ph:gear-six-duotone" class="h-4 w-4" />
                <span>{{ $t('2 Factor Auth') }}</span>
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
