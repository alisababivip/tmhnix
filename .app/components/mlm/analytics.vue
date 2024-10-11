<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { getUserAnalytics } = useMlm() // Assuming useAnalytics is your composable
const { useSparklineConfiguration } = useUtils()

// Initialize the chart data structures for referrals and rewards
const referralsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [{ name: 'Referrals', data: [] }],
})

const activeReferralsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [{ name: 'Active Referrals', data: [] }],
})

const claimedRewardsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [{ name: 'Claimed Rewards', data: [] }],
})

const totalRewardsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [{ name: 'Total Rewards', data: [] }],
})

let chartKey = ref(0)

// Function to transform the analytics data to counts per day
function transformToCountsPerDay(data) {
  // Generate last 30 dates in YYYY-MM-DD format to match the backend format
  const last30Days = [...Array(30)]
    .map((_, i) => {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      return d.toISOString().split('T')[0] // Ensure the date format is YYYY-MM-DD
    })
    .reverse()

  // Create a map for quick lookup from the data
  const countMap = new Map(data.map((item) => [item.date, item.count]))

  // Map the last 30 days to counts, defaulting to 0 if no data is present
  return last30Days.map((date) => countMap.get(date) || 0)
}

// Force a re-render of the chart
const reinitializeChart = () => {
  chartKey.value++
}

onMounted(async () => {
  const response = await getUserAnalytics()
  if (response.status === 'success') {
    const analyticsData = response.data.result

    // Transform data for each new category
    const referralsCountsPerDay = transformToCountsPerDay(
      analyticsData.referrals,
    )
    const activeReferralsCountsPerDay = transformToCountsPerDay(
      analyticsData.activeReferrals,
    )
    const claimedRewardsCountsPerDay = transformToCountsPerDay(
      analyticsData.claimedRewards,
    )
    const totalRewardsCountsPerDay = transformToCountsPerDay(
      analyticsData.totalRewards,
    )

    // Update sparkline data for each new category
    referralsSparkline.value = useSparklineConfiguration(
      undefined,
      'referrals',
      'Referrals',
      'info',
      referralsCountsPerDay,
    )
    activeReferralsSparkline.value = useSparklineConfiguration(
      undefined,
      'referrals',
      'Active Referrals',
      'success',
      activeReferralsCountsPerDay,
    )
    claimedRewardsSparkline.value = useSparklineConfiguration(
      undefined,
      'rewards',
      'Claimed Rewards',
      'success',
      claimedRewardsCountsPerDay,
    )
    totalRewardsSparkline.value = useSparklineConfiguration(
      undefined,
      'rewards',
      'Total Rewards',
      'warning',
      totalRewardsCountsPerDay,
    )

    // Force re-render of the charts
    reinitializeChart()
  }
})
</script>

<template>
  <div>
    <div class="grid grid-cols-12 gap-5">
      <!-- New Chart: Referrals -->
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="referralsSparkline"
            :key="chartKey"
            icon="fluent:people-team-20-regular"
            icon-color="info"
          />
        </BaseCard>
      </div>

      <!-- New Chart: Active Referrals -->
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="activeReferralsSparkline"
            :key="chartKey"
            icon="fluent:people-team-20-filled"
            icon-color="success"
          />
        </BaseCard>
      </div>

      <!-- New Chart: Claimed Rewards -->
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="claimedRewardsSparkline"
            :key="chartKey"
            icon="emojione-v1:money-bag"
            icon-color="success"
          />
        </BaseCard>
      </div>

      <!-- New Chart: Total Rewards -->
      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="totalRewardsSparkline"
            :key="chartKey"
            icon="icon-park-outline:finance"
            icon-color="warning"
          />
        </BaseCard>
      </div>
    </div>
  </div>
</template>
