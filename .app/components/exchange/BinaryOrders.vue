<script setup lang="ts">
const props = defineProps({
  currency: {
    type: String,
    required: true,
  },
  pair: {
    type: String,
    required: true,
  },
})

const marketStore = useMarketStore()
const userStore = useUserStore()
const route = useRoute()

const activeItem = ref('openOrders')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}

const activeFilter = ref('openOrders')
const perPage = ref(4)

const items = computed(() => {
  return marketStore.binaryPositions
    .filter((item) => {
      if (activeFilter.value === 'openOrders') {
        return item.status === 'PENDING'
      }
      return item.status !== 'PENDING'
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

const status = (status: string) => {
  switch (status) {
    case 'WIN':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'LOSS':
      return 'danger'
    case 'CANCELLED':
      return 'danger'
    case 'REJECTED':
      return 'danger'
    case 'DRAW':
      return 'MUTED'
    default:
      return 'info'
  }
}
const { formatedDate } = useUtils()

const profit = (item: any) => {
  if (item.status === 'PENDING') return 'Pending'
  let profit, classColor
  if (item.status === 'WIN') {
    profit = `+${item.amount * (item.profit / 100)}`
    classColor = 'text-success-500'
  }
  if (item.status === 'LOSS') {
    profit = `${-item.amount}`
    classColor = 'text-danger-500'
  }
  if (item.status === 'DRAW') {
    profit = '0'
    classColor = 'text-muted'
  }
  return `<span class="${classColor}">${profit}</span>`
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
        {{ $t('Open Positions') }}
      </button>
      <button
        class="py-2 px-4 text-xs font-medium"
        :class="activeFilter === 'orderHistory' ? 'active-tab' : 'inactive-tab'"
        @click="activeFilter = 'orderHistory'"
      >
        {{ $t('Positions History') }}
      </button>
    </div>
    <div id="tradesContent" class="h-full">
      <div class="h-full overflow-hidden">
        <div v-if="isActive('openOrders')" id="openOrders">
          <div
            v-if="!userStore.isLoggedIn"
            class="flex justify-center items-center flex-col h-[200px]"
          >
            <div
              style="inset: 0px; border: 1px dashed rgba(243, 243, 243, 0.08)"
              class="w-64 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-md text-sm flex text-center justify-center"
            >
              <NuxtLink class="text-warning-500 mr-1" to="/login">{{
                $t('Login')
              }}</NuxtLink>
              {{ $t('') }}or
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
            {{ $t('No Open Positons Found') }}
          </div>
          <div v-else class="w-full mt-2">
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
                    {{ $t('Symbol') }}
                  </th>
                  <th
                    class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                  >
                    {{ $t('Side') }}
                  </th>
                  <th
                    class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                  >
                    {{ $t('Price') }}
                  </th>
                  <th
                    class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                  >
                    {{ $t('Close Price') }}
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
                      {{ item.symbol }}
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                    >
                      {{ item.side }}
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                    >
                      {{ item.price }}
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-center"
                    >
                      <span
                        :class="{
                          'text-success-500': item.status === 'WIN',
                          'text-danger-500': item.status === 'LOSS',
                          'text-muted': item.status === 'DRAW',
                        }"
                        >{{ item.close_price }}</span
                      >
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                    >
                      {{ item.amount }}
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-center"
                    >
                      <span v-html="profit(item)"></span>
                    </td>
                    <td
                      class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                    >
                      <span
                        class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                        :class="`bg-${status(item.status)}-100 text-${status(
                          item.status,
                        )}-500 border-${status(
                          item.status,
                        )}-100 dark:border-${status(
                          item.status,
                        )}-500 dark:text-${status(item.status)}-500`"
                        >{{ item.status }}</span
                      >
                    </td>
                  </tr>
                </TransitionGroup>
              </tbody>
            </table>
            <div
              v-if="$viewport.isLessThan('sm')"
              class="grid gap-2 px-2 overflow-y-auto no-scrollbar h-auto max-h-[250px]"
              :class="{
                'grid-cols-1': true,
              }"
            >
              <BaseCard
                v-for="(item, index) in paginatedItems"
                :key="index"
                class="bg-white dark:bg-gray-900 rounded-lg p-4"
                shadow="sm"
              >
                <div class="text-xs text-gray-700 dark:text-gray-200 space-y-1">
                  <div class="flex justify-between">
                    <span>{{ $t('Date') }}:</span>
                    <span>{{ formatedDate(item.created_at, true) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Symbol') }}:</span>
                    <span>{{ item.symbol }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Side') }}:</span>
                    <span>{{ item.side }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Price') }}:</span>
                    <span>{{ item.price }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Amount') }}:</span>
                    <span>{{ item.amount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Profit') }}:</span>
                    <span v-html="profit(item)"></span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('Status') }}:</span>
                    <span
                      class="inline-block px-2 font-sans transition-shadow duration-300 py-0.5 text-[0.55rem] rounded-md border dark:bg-transparent"
                      :class="`bg-${status(item.status)}-100 text-${status(
                        item.status,
                      )}-500 border-${status(
                        item.status,
                      )}-100 dark:border-${status(
                        item.status,
                      )}-500 dark:text-${status(item.status)}-500`"
                    >
                      {{ item.status }}
                    </span>
                  </div>
                </div>
              </BaseCard>
            </div>
            <div class="mt-2 px-3 pb-5">
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
</template>
