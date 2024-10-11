<script setup lang="ts">
import type { Investment } from '~~/types'

const { getInvestments } = useInvestment()
const { useSparklineConfiguration } = useUtils()

const useInvestmentsSparkline = (investments: Investment[]) =>
  useSparklineConfiguration(
    investments,
    'investments',
    'Total Investments',
    'primary',
  )

const useActiveInvestmentsSparkline = (investments: Investment[]) =>
  useSparklineConfiguration(
    investments.filter((u) => u.status === 'ACTIVE'),
    'investments',
    'Active Investments',
    'warning',
  )

const useCompletedInvestmentsSparkline = (investments: Investment[]) =>
  useSparklineConfiguration(
    investments.filter((u) => u.status === 'COMPLETED'),
    'investments',
    'Completed Investments',
    'success',
  )

const investmentsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Total Investmentss',
      data: [],
    },
  ],
})

const activeInvestmentsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Active Investments',
      data: [],
    },
  ],
})

const completedInvestmentsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Completed Investments',
      data: [],
    },
  ],
})

let chartKey = ref(0)

// Force a re-render of the chart
const reinitializeChart = () => {
  chartKey.value++
}
onMounted(async () => {
  const response = await getInvestments()
  if (response.status === 'success') {
    const investments = response.data.result
    reinitializeChart()

    investmentsSparkline.value = useInvestmentsSparkline(investments)
    activeInvestmentsSparkline.value =
      useActiveInvestmentsSparkline(investments)
    completedInvestmentsSparkline.value =
      useCompletedInvestmentsSparkline(investments)
  }
})
</script>

<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="investmentsSparkline"
            :key="chartKey"
            icon="fluent-mdl2:away-status"
            icon-color="primary"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="activeInvestmentsSparkline"
            :key="chartKey"
            icon="pajamas:status"
            icon-color="warning"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="completedInvestmentsSparkline"
            :key="chartKey"
            icon="pajamas:status-closed"
            icon-color="success"
          />
        </BaseCard>
      </div>
    </div>
  </div>
</template>
