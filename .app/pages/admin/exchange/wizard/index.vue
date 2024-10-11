<script setup lang="ts">
import type { ExchangeType } from '~~/types'

definePageMeta({
  title: 'Exchange Wizard — Step 1',
})

const { getNextStep, data: project, goToStep } = useMultiStepForm()

useHead({
  title: 'Project type',
})

const apiPath = useRuntimeConfig().public.apiPath
onMounted(async () => {
  if (!project.value.exchange) {
    try {
      const response = await $fetch(
        apiPath + `/api/exchange/settings/get/details`,
        {
          credentials: 'include',
          headers: {
            'client-platform': 'browser',
          },
        },
      )
      const data = response.data?.result

      if (data.exchange) {
        project.value.exchange = data.exchange.name
        project.value.activeExchange = data.exchange.name
        project.value.productId = data.exchange.productId
        project.value.licenseStatus = data.exchange.licenseStatus
        project.value.username = data.exchange.username
        if (data.symbols) {
          project.value.symbols = data.symbols
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
})

function onSelectExchange(exchange: ExchangeType, productId: string) {
  const next = getNextStep()
  if (next) {
    project.value.exchange = exchange
    ;(project.value.productId = productId), goToStep(next)
  }
}
</script>

<template>
  <div class="h-full">
    <WizardStepTitle />
    <div class="mx-auto w-full max-w-6xl px-4 text-center">
      <div class="ltablet:grid-cols-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <ExchangeWizardExchangeCard
          exchange="kucoin"
          productId="6D0DD3C8"
          imgSrc="/img/exchanges/kucoin.svg"
          title="Restricted Countries List"
          content="The United States, North Korea, Singapore, Hong Kong, Iran, The Crimean region"
          :selectedExchange="project.exchange"
          :nextStep="getNextStep()?.to"
          :onSelect="onSelectExchange"
        />
        <ExchangeWizardExchangeCard
          exchange="binance"
          productId="EBAC01EE"
          imgSrc="/img/exchanges/binance.svg"
          title="Supported Countries List"
          content="Countries and Regions"
          link="https://www.binance.com/en/country-region-selector"
          :selectedExchange="project.exchange"
          :nextStep="getNextStep()?.to"
          :onSelect="onSelectExchange"
        />
      </div>
    </div>
    <div class="absolute bottom-10 mx-auto w-full flex justify-center">
      <BaseButton
        type="button"
        color="muted"
        class="w-48"
        to="/admin/settings/exchange"
      >
        {{ $t('Exit Wizard') }}
      </BaseButton>
    </div>
  </div>
</template>
