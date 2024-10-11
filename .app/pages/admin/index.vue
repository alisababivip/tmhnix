<script setup lang="ts">
definePageMeta({
  permissions: ['Access Admin Dashboard'],
  title: 'Admin Dashboard',
})
</script>

<template>
  <div class="space-y-5">
    <AdminDashboardUsersChart
      v-can="'View Users'"
      class="border-b pb-5 border-gray-200 dark:border-gray-700"
    />
    <AdminDashboardWalletsChart
      v-can="'View Wallets'"
      class="border-b pb-5 border-gray-200 dark:border-gray-700"
    />

    <AdminDashboardBinaryCharts
      v-can="'View Wallets'"
      class="border-b pb-5 border-gray-200 dark:border-gray-700"
    />

    <AdminDashboardInvestmentChart
      v-can="'Access Investment Logs'"
      class="border-b pb-5 border-gray-200 dark:border-gray-700"
    />
  </div>
</template>
