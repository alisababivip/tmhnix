<script setup lang="ts">
import type { User } from '~~/types'
const userStore = useUserStore()
const user = computed<User | null>(() => userStore.getProfile)
</script>

<template>
  <NuxtLink
    to="/user/profile-edit"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
  >
    <span
      class="bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full"
    >
      <img
        loading="lazy"
        :src="user?.avatar ? user.avatar : '/img/avatars/1.svg'"
        class="max-w-full rounded-full object-cover shadow-sm dark:border-transparent h-full"
        alt=""
      />
    </span>
  </NuxtLink>
</template>
