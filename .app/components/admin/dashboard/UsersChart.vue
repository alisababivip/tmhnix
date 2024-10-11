<script setup lang="ts">
const { getUsersAnalytics } = useUsers()
const { useSparklineConfiguration } = useUtils()

// Initialize the chart data structures
const registrationsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Total Registrations',
      data: [],
    },
  ],
})

const activeUsersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Active Users',
      data: [],
    },
  ],
})

const bannedUsersSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Banned Users',
      data: [],
    },
  ],
})

const verifiedEmailsSparkline = ref({
  type: 'area',
  height: 130,
  options: {},
  series: [
    {
      name: 'Verified Emails',
      data: [],
    },
  ],
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

// Your transformToCountsPerDay function will be used as is

onMounted(async () => {
  const response = await getUsersAnalytics()
  if (response.status === 'success') {
    const analyticsData = response.data.result

    // Now you need to call transformToCountsPerDay for each category separately
    const registrationsCountsPerDay = transformToCountsPerDay(
      analyticsData.registrations,
    )
    const activeUsersCountsPerDay = transformToCountsPerDay(
      analyticsData.activeUsers,
    )
    const bannedUsersCountsPerDay = transformToCountsPerDay(
      analyticsData.bannedUsers,
    )
    const verifiedEmailsCountsPerDay = transformToCountsPerDay(
      analyticsData.verifiedEmails,
    )

    // Update the sparkline data with the transformed counts for each category
    registrationsSparkline.value = useSparklineConfiguration(
      undefined,
      'users',
      'Total Registrations',
      'primary',
      registrationsCountsPerDay,
    )
    activeUsersSparkline.value = useSparklineConfiguration(
      undefined,
      'users',
      'Active Users',
      'warning',
      activeUsersCountsPerDay,
    )
    bannedUsersSparkline.value = useSparklineConfiguration(
      undefined,
      'users',
      'Banned Users',
      'danger',
      bannedUsersCountsPerDay,
    )
    verifiedEmailsSparkline.value = useSparklineConfiguration(
      undefined,
      'users',
      'Verified Emails',
      'success',
      verifiedEmailsCountsPerDay,
    )

    // Force re-render of the charts
    reinitializeChart()
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
            v-bind="registrationsSparkline"
            :key="chartKey"
            icon="fluent:people-48-regular"
            icon-color="primary"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="activeUsersSparkline"
            :key="chartKey"
            icon="fluent:person-available-20-regular"
            icon-color="warning"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="verifiedEmailsSparkline"
            :key="chartKey"
            icon="fluent:person-key-20-regular"
            icon-color="success"
          />
        </BaseCard>
      </div>

      <div
        class="ltablet:col-span-3 relative xs:col-span-12 sm:col-span-6 lg:col-span-3"
      >
        <BaseCard class="pt-4">
          <AddonApexcharts
            v-bind="bannedUsersSparkline"
            :key="chartKey"
            icon="line-md:account-delete"
            icon-color="danger"
          />
        </BaseCard>
      </div>
    </div>
  </div>
</template>
