<script setup lang="ts">
definePageMeta({
  title: 'Exchange Wizard — Step 6',
})
const { data: project } = useMultiStepForm()

const exchangeLogos = ref({
  kucoin: '/img/exchanges/kucoin.svg',
  binance: '/img/exchanges/binance.svg',
})
const exchangeLogo = computed(() => exchangeLogos.value[project.value.exchange])
</script>

<template>
  <div>
    <WizardStepTitle />
    <div class="mx-auto w-full max-w-6xl px-4 text-center space-y-5">
      <BaseCard class="p-4 max-w-sm mx-auto">
        <img
          :src="exchangeLogo"
          class="h-[100px] w-full mx-auto p-5"
          alt="Exchange"
        />
      </BaseCard>
      <div class="grid gap-5 grid-cols-2 max-w-sm mx-auto">
        <BaseCard class="p-4">
          <BaseHeading as="h3" size="lg" weight="medium" lead="none">
            {{ $t('Connection') }}
          </BaseHeading>
          <p :class="project.connection ? 'text-green-500' : 'text-red-500'">
            {{ project.connection ? 'Connected' : 'Disconnected' }}
          </p>
        </BaseCard>
        <BaseCard class="p-4">
          <BaseHeading as="h3" size="lg" weight="medium" lead="none">
            {{ $t('Symbols') }}
          </BaseHeading>
          <p>{{ Object.keys(project.symbols).length }}</p>
        </BaseCard>
      </div>
      <BaseButton
        v-if="project.status"
        type="button"
        to="/admin/settings/exchange"
        color="success"
        class="w-full max-w-sm"
      >
        {{ $t('Exit Wizard') }}
      </BaseButton>
    </div>
  </div>
</template>
