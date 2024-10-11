<script setup lang="ts">
definePageMeta({
  title: 'Exchange Wizard — Step 4',
})
const router = useRouter()
const { data: project } = useMultiStepForm()
if (!project.value.exchange) {
  router.push('/admin/exchange/wizard')
}
const symbolsByPair = ref({})
const selectedSymbols = ref({})
const loading = ref(true)
const activeTab = ref('')

const apiPath = useRuntimeConfig().public.apiPath
onMounted(async () => {
  loading.value = true
  const response = await $fetch(
    `${apiPath}/api/exchange/settings/fetch/markets`,
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
  if (response.status === 'success') {
    symbolsByPair.value = response.data.result

    if (Object.keys(project.value.symbols).length > 0) {
      for (const symbolKey in project.value.symbols) {
        selectedSymbols.value[symbolKey] = true
      }
    }
    if (Object.keys(symbolsByPair.value).length > 0) {
      activeTab.value = Object.keys(symbolsByPair.value)[0] // Initialize to the first tab
    }
    loading.value = false
  }
})

watch(selectedSymbols.value, (newVal) => {
  project.value.symbols = Object.keys(newVal)
    .filter((symbolKey) => newVal[symbolKey])
    .reduce((acc, symbolKey) => {
      // Determine the pair that the symbol belongs to
      const pair = Object.keys(symbolsByPair.value).find(
        (p) => symbolsByPair.value[p][symbolKey],
      )

      if (pair) {
        if (project.value.symbols[symbolKey]) {
          // Existing market: Merge new data with existing, retaining specific properties
          acc[symbolKey] = {
            ...symbolsByPair.value[pair][symbolKey], // New data from fetched market
            precision: project.value.symbols[symbolKey].precision,
            limits: project.value.symbols[symbolKey].limits,
            taker: project.value.symbols[symbolKey].taker,
            maker: project.value.symbols[symbolKey].maker,
          }
        } else {
          // New market: Use fetched data as it is
          acc[symbolKey] = symbolsByPair.value[pair][symbolKey]
        }
      }
      return acc
    }, {})
})

const tabs = computed(() => {
  return Object.keys(symbolsByPair.value).map((pair) => ({
    value: pair,
    label: pair,
  }))
})

// Method to select all symbols in the active tab
const selectAll = (activeValue) => {
  for (const symbolKey in symbolsByPair.value[activeValue]) {
    selectedSymbols.value[symbolKey] = true
  }
}

// Method to clear selection in the active tab
const clearSelection = (activeValue) => {
  for (const symbolKey in symbolsByPair.value[activeValue]) {
    selectedSymbols.value[symbolKey] = false
  }
}
</script>

<template>
  <div class="w-full">
    <WizardStepTitle />
    <div
      v-if="loading"
      class="grid gap-5 xs:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <BaseCard
        v-for="index in 40"
        :key="index"
        shape="curved"
        class="flex items-center gap-3 p-4"
      >
        <div class="grow space-y-2">
          <BasePlaceload class="h-3 w-4/5 rounded-lg" />
          <BasePlaceload class="h-3 w-3/5 rounded-lg" />
        </div>
      </BaseCard>
    </div>
    <BaseTabs type="box" :tabs="tabs" v-model="activeTab">
      <template #tab="{ activeValue }">
        <div class="flex justify-end mb-3 gap-2">
          <BaseButton
            @click="selectAll(activeValue)"
            color="primary"
            type="button"
          >
            {{ $t('Select All') }}
          </BaseButton>
          <BaseButton
            @click="clearSelection(activeValue)"
            color="danger"
            type="button"
          >
            {{ $t('Clear Selection') }}
          </BaseButton>
        </div>
        <div
          v-if="symbolsByPair[activeValue]"
          class="grid gap-5 xs:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          <div
            v-for="(market, symbolKey) in symbolsByPair[activeValue]"
            :key="symbolKey"
          >
            <BaseCheckboxHeadless v-model="selectedSymbols[symbolKey]">
              <!-- Render Checkbox Card for Each Symbol -->
              <BaseCard
                shape="rounded"
                class="peer-checked:!border-primary-500 peer-checked:[&_.child]:!text-primary-500 border-2 p-4 opacity-50 peer-checked:opacity-100"
              >
                <div class="flex w-full items-center gap-2">
                  <div>
                    <BaseHeading as="h4" size="sm" weight="medium" lead="none">
                      {{ symbolKey }}
                    </BaseHeading>
                  </div>
                  <div class="child text-muted-300 ms-auto">
                    <div class="h-3 w-3 rounded-full bg-current"></div>
                  </div>
                </div>
              </BaseCard>
            </BaseCheckboxHeadless>
          </div>
        </div>
      </template>
    </BaseTabs>
  </div>
</template>
