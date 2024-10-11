<script setup lang="ts">
definePageMeta({
  title: 'Exchange Wizard — Step 5',
})
const router = useRouter()
const { data: project } = useMultiStepForm()
if (!project.value.exchange) {
  router.push('/admin/exchange/wizard')
}

// Create a local copy of the symbols to enable two-way binding in the template
const editableSymbols = ref({ ...project.value.symbols })

// Watch for changes to editableSymbols and update project.value.symbols accordingly
watch(editableSymbols, (newVal) => {
  project.value.symbols = newVal
})

// Multiplier state
const multiplier = ref(1)

// Method to apply the multiplier to all taker and maker fees
const applyMultiplier = () => {
  for (const symbolKey in editableSymbols.value) {
    editableSymbols.value[symbolKey].taker =
      editableSymbols.value[symbolKey].taker * multiplier.value
    editableSymbols.value[symbolKey].maker =
      editableSymbols.value[symbolKey].maker * multiplier.value
  }
}

// Method to get unique currencies from selected symbols
const getUniqueCurrencies = () => {
  const currencies = Object.keys(project.value.symbols).flatMap((symbolKey) =>
    symbolKey.split('/'),
  ) // Split each symbol into base and quote

  return Array.from(new Set(currencies)) // Return unique currencies
}

const { toast } = useUtils()
// Method to fetch and save currencies to project state
const apiPath = useRuntimeConfig().public.apiPath
const fetchAndSaveCurrencies = async () => {
  const uniqueCurrencies = getUniqueCurrencies()
  try {
    const response = await $fetch(
      `${apiPath}/api/exchange/settings/fetch/currencies`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        query: {
          exchange: project.value.exchange,
        },
      },
    )
    const currencyDetails = response.data.result
    // Filter the details by unique currencies
    project.value.currencies = Object.keys(currencyDetails)
      .filter((currency) => uniqueCurrencies.includes(currency))
      .reduce((acc, currency) => {
        acc[currency] = currencyDetails[currency]
        return acc
      }, {})
  } catch (error) {
    toast.danger(error as any)
  }
}

// Call the method when the component is mounted
onMounted(async () => {
  await fetchAndSaveCurrencies()
})
</script>

<template>
  <div>
    <WizardStepTitle />
    <div class="flex items-center gap-3 mb-5 justify-end">
      <BaseInput
        v-model.number="multiplier"
        type="number"
        shape="rounded"
        placeholder="Enter Multiplier"
      />
      <BaseButton @click="applyMultiplier" color="primary" type="button">
        {{ $t('Apply Multiplier') }}
      </BaseButton>
    </div>
    <div
      class="grid gap-5 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <BaseCard
        shape="rounded"
        class="p-4"
        v-for="(item, key, index) in editableSymbols"
        :key="index"
      >
        <div class="flex flex-col w-full items-start gap-2">
          <BaseHeading as="h4" size="sm" weight="medium" lead="none">
            {{ key }} {{ $t('Fees') }}
          </BaseHeading>
          <BaseInput
            v-model.number="item.taker"
            type="number"
            shape="rounded"
            label="Taker"
            placeholder="Taker Fee"
          />
          <BaseInput
            v-model.number="item.maker"
            type="number"
            shape="rounded"
            label="Maker"
            placeholder="Maker Fee"
          />
        </div>
      </BaseCard>
    </div>
  </div>
</template>
