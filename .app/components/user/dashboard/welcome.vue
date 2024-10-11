<script setup lang="ts">
import type { User } from '~~/types'

const props = defineProps({
  user: Object as PropType<User>,
})
</script>
<template>
  <div
    class="bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row"
  >
    <div
      class="relative w-[320px]"
      :class="{
        'h-[170px]': $viewport.isLessThan('sm'),
        'h-[175px]': $viewport.isGreaterOrEquals('sm'),
      }"
    >
      <LottieCourse
        v-if="user?.twofactor?.enabled"
        height="300px"
        classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-10"
      />
      <LottieSecurity
        v-else
        height="300px"
        classes="pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-10"
      />
    </div>
    <div class="mt-16 grow sm:mt-0">
      <div class="pb-4 text-center sm:pb-0 sm:text-left">
        <BaseHeading tag="h1" class="text-white opacity-90">
          <span>Hello, {{ user?.first_name }}</span>
        </BaseHeading>
        <BaseParagraph size="sm" class="max-w-xs text-white opacity-70">
          <span>
            {{
              user?.twofactor?.enabled
                ? 'Congratulations! Your account is secured with two-factor authentication'
                : 'For a better experience and your account security, please enable two-factor authentication'
            }}
          </span>
        </BaseParagraph>
        <div class="mt-2">
          <BaseButton
            v-if="!user?.twofactor?.enabled"
            size="sm"
            color="light"
            flavor="outline"
            class="w-full sm:w-auto"
            to="/user/profile-edit/two-factor"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            <span> {{ $t('Add two-factor authentication') }}</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
