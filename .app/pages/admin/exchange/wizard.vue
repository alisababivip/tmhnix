<script setup lang="ts">
definePageMeta({
  permissions: ['Access Exchange Wizard'],
  layout: 'empty',
  title: 'Exchange Wizard',
})

const marketStore = useMarketStore()

const initialState = ref({
  exchange: undefined,
  activeExchange: undefined,
  productId: undefined,
  licenseStatus: false,
  username: undefined,
  connection: false,
  symbols: {},
  currencies: {},
  status: false,
})

const wizardSteps = [
  {
    to: '/admin/exchange/wizard',
    meta: {
      name: 'Selection',
      title: 'Select the Exchange',
      subtitle: 'Choose the exchange provider you want to use',
    },
  },
  {
    to: '/admin/exchange/wizard/step-2',
    meta: {
      name: 'License',
      title: 'Add the Exchange License',
      subtitle: 'Add the license for the exchange provider you want to use',
    },
  },
  {
    to: '/admin/exchange/wizard/step-3',
    meta: {
      name: 'Credentials',
      title: 'Add the Exchange Credentials',
      subtitle: 'Add the credentials for the exchange provider you want to use',
    },
  },
  {
    to: '/admin/exchange/wizard/step-4',
    meta: {
      name: 'Markets',
      title: 'Select the Exchange Markets',
      subtitle: 'Select the markets you want to use for your exchange',
    },
  },
  {
    to: '/admin/exchange/wizard/step-5',
    meta: {
      name: 'Fees',
      title: 'Set the Exchange Fees',
      subtitle: 'Set the fees for the exchange markets you want to use',
    },
  },
  {
    to: '/admin/exchange/wizard/step-6',
    meta: {
      name: 'Finish',
      title: 'Finish the Exchange Wizard',
      subtitle: 'Finish the wizard of the exchange provider you want to use',
    },
  },
]

const { toast } = useUtils()
const apiPath = useRuntimeConfig().public.apiPath

const { handleSubmit, currentStep } = createMultiStepForm({
  initialState: initialState,
  steps: wizardSteps,
  onSubmit: async (state, ctx) => {
    if (!state.exchange) {
      ctx.goToStep(ctx.getStep(0))
      throw new Error('Please select an exchange')
    }
    if (state.licenseStatus === false) {
      ctx.goToStep(ctx.getStep(1))
      throw new Error('Please add the exchange license & verify it')
    }
    if (!state.connection && state.connection !== true) {
      ctx.goToStep(ctx.getStep(2))
      throw new Error(
        'Please add the exchange credentials & check the connection',
      )
    }
    if (!state.symbols || state.symbols.length === 0) {
      ctx.goToStep(ctx.getStep(3))
      throw new Error('Please select at least one symbol')
    }

    try {
      const response = await $fetch(
        apiPath + `/api/exchange/settings/save/markets`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'client-platform': 'browser',
          },
          body: {
            exchange: state.exchange,
            symbols: state.symbols,
            currencies: state.currencies,
          },
        },
      )
      toast.response(response)
      if (response.status === 'success') {
        state.status = true

        toast.successText(
          `${
            state.exchange.charAt(0).toUpperCase() + state.exchange.slice(1)
          } exchange installed successfully!`,
        )

        await marketStore.fetchMarkets()
      }
    } catch (error) {
      throw new Error(error.data.message)
    }
  },
  onError: (error) => {
    toast.danger(error)
  },
})

useHead({
  titleTemplate: (title) =>
    `${title} | Exchange Wizard - Step ${currentStep.value + 1}`,
})
</script>

<template>
  <TairoSidebarLayout
    :toolbar="false"
    :sidebar="false"
    class="bg-muted-100 dark:bg-muted-900 min-h-screen w-full"
  >
    <template #logo>
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
        @click.prevent="$router.back()"
      >
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </NuxtLink>
    </template>

    <WizardNavigation />

    <form action="" method="POST" @submit.prevent="handleSubmit" novalidate>
      <div class="pb-32 pt-24">
        <RouterView />
      </div>
      <WizardButtons />
    </form>
  </TairoSidebarLayout>
</template>
