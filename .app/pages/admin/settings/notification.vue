<script setup lang="ts">
definePageMeta({
  title: 'Notification Settings',
  permissions: ['Access Notification Settings'],
})
</script>

<template>
  <TairoContentWrapper>
    <div
      class="grid w-full xs:grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xs:w-60"
    >
      <BaseCard
        shape="curved"
        elevated-hover
        class="hover:!border-primary-500 group border-2"
      >
        <NuxtLink
          to="/admin/settings/notifications/email/test"
          class="block p-6"
        >
          <div class="text-center">
            <Icon
              name="tabler:mail-cog"
              class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6"
            />
            <BaseHeading
              tag="h3"
              size="sm"
              weight="semibold"
              class="mt-2 !text-[0.65rem] uppercase"
            >
              {{ $t('Test Email') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Test your email credentials') }}
            </BaseText>
          </div>
        </NuxtLink>
      </BaseCard>
      <BaseCard
        shape="curved"
        elevated-hover
        class="hover:!border-primary-500 group border-2"
      >
        <NuxtLink
          to="/admin/settings/notifications/templates"
          class="block p-6"
        >
          <div class="text-center">
            <Icon
              name="fluent:mail-template-24-regular"
              class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6"
            />
            <BaseHeading
              tag="h3"
              size="sm"
              weight="semibold"
              class="mt-2 !text-[0.65rem] uppercase"
            >
              {{ $t('Templates') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Manage your notification templates') }}
            </BaseText>
          </div>
        </NuxtLink>
      </BaseCard>
    </div>
  </TairoContentWrapper>
</template>
