<script setup lang="ts">
import { useAiTradingInvestmentStore } from '~~/store/extensions/ai-trading/investment'
const userStore = useUserStore()
const aiTradingInvestmentStore = useAiTradingInvestmentStore()
const orders = computed(() => aiTradingInvestmentStore.investments)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    if (aiTradingInvestmentStore.investments.length === 0) {
      await aiTradingInvestmentStore.fetchInvestments()
    }
  }
})

const activeItem = ref('openOrders')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}

const route = useRoute()
const activeFilter = ref('openOrders')
const perPage = ref(4)

const items = computed(() => {
  return (orders.value ?? [])
    .filter((item) => {
      if (!item) return false // Skip if item is null or undefined

      if (activeFilter.value === 'openOrders') {
        return item.status === 'ACTIVE'
      }
      return item.status !== 'ACTIVE'
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
})

const page = computed(() => parseInt((route.query.page as string) ?? '1'))
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return items.value.slice(start, end)
})

const { formatedDate } = useUtils()

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'ACTIVE':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    default:
      return 'gray'
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 shadow relative h-full w-full"
    :class="{
      'rounded-tr-lg': $viewport.isGreaterOrEquals('sm'),
    }"
  >
    <div
      class="w-full bg-gray-100 dark:bg-gray-800 flex"
      :class="{
        'rounded-tr-lg': $viewport.isGreaterOrEquals('sm'),
      }"
    >
      <button
        class="py-2 px-4 text-xs font-medium"
        :class="activeFilter === 'openOrders' ? 'active-tab' : 'inactive-tab'"
        @click="activeFilter = 'openOrders'"
      >
        {{ $t('Active Investments') }}
      </button>
      <button
        class="py-2 px-4 text-xs font-medium"
        :class="activeFilter === 'orderHistory' ? 'active-tab' : 'inactive-tab'"
        @click="activeFilter = 'orderHistory'"
      >
        {{ $t('Investment History') }}
      </button>
    </div>
    <div id="tradesContent" class="h-full">
      <div class="h-full overflow-hidden">
        <div
          v-if="isActive('openOrders')"
          id="openOrders"
          class="h-auto max-h-full"
        >
          <div
            v-if="!userStore.isLoggedIn"
            class="flex justify-center items-center flex-col h-full"
          >
            <div
              style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
              class="w-64 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex text-center justify-center"
            >
              <NuxtLink class="text-warning-500 mr-1" to="/login">{{
                $t('Login')
              }}</NuxtLink>
              {{ $t('or') }}
              <NuxtLink class="text-warning-500 ml-1" to="/register">{{
                $t('Register')
              }}</NuxtLink>
            </div>
          </div>
          <div
            v-else-if="paginatedItems?.length === 0"
            class="flex w-full justify-center items-center flex-col text-gray-500 dark:text-gray-500 h-[200px]"
          >
            <Icon name="ph:files-thin" class="h-16 w-16" />
            {{ $t('No Orders Found') }}
          </div>
          <div v-else class="w-full mt-2">
            <div class="pb-5">
              <table
                v-if="$viewport.isGreaterOrEquals('sm')"
                class="min-w-full bg-white dark:bg-gray-900 border-collapse"
              >
                <thead>
                  <tr>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 pb-1 text-start"
                    >
                      {{ $t('Date') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                    >
                      {{ $t('Amount') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                    >
                      {{ $t('Profit') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                    >
                      {{ $t('Status') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <TransitionGroup
                    enter-active-class="transform-gpu"
                    enter-from-class="opacity-0 -translate-x-full"
                    enter-to-class="opacity-100 translate-x-0"
                    leave-active-class="absolute transform-gpu"
                    leave-from-class="opacity-100 translate-x-0"
                    leave-to-class="opacity-0 -translate-x-full"
                  >
                    <tr v-for="(item, index) in paginatedItems" :key="index">
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-start"
                      >
                        {{ formatedDate(item.created_at, true) }}
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                      >
                        {{ item.amount }} {{ item.market?.split('/')[1] }}
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                        :class="{
                          'text-success-500':
                            item.profit > 0 && item.status === 'COMPLETED',
                          'text-danger-500':
                            (item.profit < 0 && item.status === 'COMPLETED') ||
                            item.status === 'CANCELED' ||
                            item.status === 'REJECTED',
                          'text-gray-500':
                            item.profit === 0 && item.status === 'COMPLETED',
                          'text-info-500': item.status === 'ACTIVE',
                        }"
                      >
                        <span
                          v-if="item.status !== 'COMPLETED'"
                          class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                          :class="`bg-${statusClass(
                            item.status,
                          )}-100 text-${statusClass(
                            item.status,
                          )}-500 border-${statusClass(
                            item.status,
                          )}-100 dark:border-${statusClass(
                            item.status,
                          )}-500 dark:text-${statusClass(item.status)}-500`"
                          >{{ item.status }}</span
                        >
                        <span v-else
                          >{{ item.profit }}
                          {{ item.market?.split('/')[1] }}</span
                        >
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                      >
                        <span
                          class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                          :class="`bg-${statusClass(
                            item.status,
                          )}-100 text-${statusClass(
                            item.status,
                          )}-500 border-${statusClass(
                            item.status,
                          )}-100 dark:border-${statusClass(
                            item.status,
                          )}-500 dark:text-${statusClass(item.status)}-500`"
                          >{{ item.status }}</span
                        >
                      </td>
                    </tr>
                  </TransitionGroup>
                </tbody>
              </table>
              <div
                v-else
                class="grid gap-2 px-2 overflow-y-auto no-scrollbar h-auto max-h-[200px]"
                :class="{
                  'grid-cols-1': $viewport.isLessThan('xs'),
                  'grid-cols-2': $viewport.isGreaterOrEquals('xs'),
                }"
              >
                <BaseCard
                  v-for="(item, index) in paginatedItems"
                  :key="index"
                  class="bg-white dark:bg-gray-900 rounded-lg p-4"
                  shadow="sm"
                >
                  <div
                    class="text-xs text-gray-700 dark:text-gray-200 space-y-1"
                  >
                    <div class="flex justify-between">
                      <span>{{ $t('Date') }}:</span>
                      <span>{{ formatedDate(item.created_at, true) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ $t('Amount') }}:</span>
                      <span
                        >{{ item.amount }}
                        {{ item.market?.split('/')[1] }}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span>{{ $t('Profit') }}:</span>

                      <span
                        v-if="item.status !== 'COMPLETED'"
                        class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                        :class="`bg-${statusClass(
                          item.status,
                        )}-100 text-${statusClass(
                          item.status,
                        )}-500 border-${statusClass(
                          item.status,
                        )}-100 dark:border-${statusClass(
                          item.status,
                        )}-500 dark:text-${statusClass(item.status)}-500`"
                        >{{ item.status }}</span
                      >
                      <span v-else
                        >{{ item.profit > 0 ? '+' : item.profit < 0 ? '-' : ''
                        }}{{ item.profit }}
                        {{ item.market?.split('/')[1] }}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span>{{ $t('Status') }}:</span>

                      <div class="flex justify-between items-center gap-2">
                        <span
                          class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                          :class="`bg-${statusClass(
                            item.status,
                          )}-100 text-${statusClass(
                            item.status,
                          )}-500 border-${statusClass(
                            item.status,
                          )}-100 dark:border-${statusClass(
                            item.status,
                          )}-500 dark:text-${statusClass(item.status)}-500`"
                          >{{ item.status }}</span
                        >
                      </div>
                    </div>
                  </div>
                </BaseCard>
                <div class="mt-2 px-3">
                  <TairoPagination
                    v-if="items.length > perPage"
                    :current-page="page"
                    :total-items="items.length"
                    :item-per-page="perPage"
                    :max-links-displayed="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.no-scrollbar {
  /* For Webkit browsers */
  -webkit-overflow-scrolling: touch;
  overflow-y: scroll; /* Adds scrolling */
}

.no-scrollbar::-webkit-scrollbar {
  width: 0px; /* Hide scrollbar for Chrome, Safari and Opera */
}

.no-scrollbar {
  -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
}
</style>
