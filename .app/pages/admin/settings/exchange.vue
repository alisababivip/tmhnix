<script setup lang="ts">
definePageMeta({
  title: 'Exchange Provider',
  permissions: ['Access Exchange Provider Settings'],
})
</script>

<template>
  <TairoContentWrapper>
    <div
      class="grid w-full xs:grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
    >
      <BaseCard
        shape="curved"
        elevated-hover
        class="hover:!border-primary-500 group border-2"
      >
        <NuxtLink to="/admin/exchange/wizard" class="block p-6">
          <div class="text-center">
            <Icon
              name="radix-icons:rocket"
              class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6"
            />
            <BaseHeading
              tag="h3"
              size="sm"
              weight="semibold"
              class="mt-2 !text-[0.65rem] uppercase"
            >
              {{ $t('Wizard') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Configure your exchange') }}
            </BaseText>
          </div>
        </NuxtLink>
      </BaseCard>
      <BaseCard
        shape="curved"
        elevated-hover
        class="hover:!border-primary-500 group border-2"
      >
        <NuxtLink to="/admin/exchange/markets" class="block p-6">
          <div class="text-center">
            <Icon
              name="cib:marketo"
              class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6"
            />
            <BaseHeading
              tag="h3"
              size="sm"
              weight="semibold"
              class="mt-2 !text-[0.65rem] uppercase"
            >
              {{ $t('Markets') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Manage your markets') }}
            </BaseText>
          </div>
        </NuxtLink>
      </BaseCard>
      <BaseCard
        shape="curved"
        elevated-hover
        class="hover:!border-primary-500 group border-2"
      >
        <NuxtLink to="/admin/exchange/currencies" class="block p-6">
          <div class="text-center">
            <Icon
              name="ph:currency-eth-light"
              class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6"
            />
            <BaseHeading
              tag="h3"
              size="sm"
              weight="semibold"
              class="mt-2 !text-[0.65rem] uppercase"
            >
              {{ $t('Currencies') }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              {{ $t('Manage your currencies') }}
            </BaseText>
          </div>
        </NuxtLink>
      </BaseCard>
    </div>
  </TairoContentWrapper>
</template>
