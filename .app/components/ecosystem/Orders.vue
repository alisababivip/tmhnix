<script setup lang="ts">
import { useEcoMarketStore } from '~~/store/extensions/ecosystem/market'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
import { useEcosystemWalletStore } from '~~/store/extensions/ecosystem/wallets/user'
const ecosystemWalletStore = useEcosystemWalletStore()
const ecoSocketStore = useEcosystemSocketStore()
const ecoMarketStore = useEcoMarketStore()
const userStore = useUserStore()
const user = computed(() => userStore.getProfile)
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

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await ecoMarketStore.fetchOrders(`${props.currency}/${props.pair}`)
    } catch (error) {
      console.log(error)
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

const orders = computed(() => {
  return ecoMarketStore.orders
})

const items = computed(() => {
  return orders.value
    .filter((item) => {
      if (!item) return false
      if (activeFilter.value === 'openOrders') {
        return item.status === 'OPEN'
      }
      return item.status !== 'OPEN'
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
    case 'OPEN':
      return 'warning'
    case 'CLOSED':
      return 'success'
    case 'CANCELED':
    case 'EXPIRED':
    case 'REJECTED':
      return 'danger'
    default:
      return 'info'
  }
}

const { formatedDate, toast } = useUtils()
const { cancelOrder } = useEcosystem()
const walletStore = useWalletStore()
const isCanceling = ref(false)

const cancel = async (uuid: string) => {
  isCanceling.value = true
  try {
    const orderCreatedAt = ecoMarketStore.orders.find(
      (order) => order.uuid === uuid,
    )?.created_at
    const response = await cancelOrder(uuid, orderCreatedAt)

    toast.response(response)
    const orderIndex = ecoMarketStore.orders.findIndex(
      (order) => order.uuid === uuid,
    )
    if (orderIndex !== -1) {
      ecoMarketStore.orders.splice(orderIndex, 1)
    }
    if (response.status === 'success') {
      await ecosystemWalletStore.fetchWallets(false, false)
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCanceling.value = false
}

// Subscribe to WebSocket for orders when the component is mounted
onMounted(async () => {
  if (userStore.isLoggedIn) {
    if (ecoMarketStore.orders.length === 0) {
      await ecoMarketStore.fetchOrders(`${props.currency}/${props.pair}`)
    }
    subscribeToOrderUpdates()
  }
})

// Watch for WebSocket being open
watch(
  () => ecoSocketStore.isSocketOpen,
  (isSocketOpen) => {
    if (isSocketOpen) {
      subscribeToOrderUpdates()
    } else {
      unsubscribeFromOrderUpdates()
    }
  },
)

// Subscribe to WebSocket channel for orders
const subscribeToOrderUpdates = () => {
  if (ecoSocketStore.isSocketOpen) {
    ecoSocketStore.subscribe('exchange', {
      method: 'orders',
      id: `${user.value?.id}`,
    })
  }
}

// Unsubscribe from WebSocket channel for orders
const unsubscribeFromOrderUpdates = () => {
  ecoSocketStore.unsubscribe('exchange', {
    method: 'orders',
    id: `${user.value?.id}`,
  })
}

// Watching the WebSocket data for orders
watch(
  () => ecoSocketStore.orders,
  async (updatedOrder) => {
    if (!updatedOrder || !updatedOrder.uuid) {
      return
    }

    const orderIndex = ecoMarketStore.orders.findIndex(
      (order) => order.uuid === updatedOrder.uuid,
    )

    if (orderIndex !== -1) {
      const existingOrder = ecoMarketStore.orders[orderIndex]

      // Update the order in the store
      ecoMarketStore.orders[orderIndex] = {
        ...existingOrder,
        ...updatedOrder,
      }

      // Check if the 'filled' field has changed
      if (existingOrder.filled !== updatedOrder.filled) {
        // Fetch wallets only if the 'filled' field has changed
        await ecosystemWalletStore.fetchWallets(false, false)
      }
    }
  },
)

onBeforeUnmount(() => {
  unsubscribeFromOrderUpdates()
})
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
        {{ $t('Open Orders') }}
      </button>
      <button
        class="py-2 px-4 text-xs font-medium"
        :class="activeFilter === 'orderHistory' ? 'active-tab' : 'inactive-tab'"
        @click="activeFilter = 'orderHistory'"
      >
        {{ $t('Order History') }}
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
                      {{ $t('Amount') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                    >
                      {{ $t('Filled') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                    >
                      {{ $t('Status') }}
                    </th>
                    <th
                      class="px-4 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center pb-1"
                      v-if="activeFilter === 'openOrders'"
                    >
                      {{ $t('Actions') }}
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
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-center"
                        :class="{
                          'text-green-500': item.side === 'BUY',
                          'text-red-500': item.side === 'SELL',
                        }"
                      >
                        {{ item.side }}
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                      >
                        {{ item.price }}
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                      >
                        {{ item.amount }}
                      </td>
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                      >
                        {{ item.filled }}
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
                      <td
                        class="px-4 py-1 border-b border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 text-center"
                        v-if="activeFilter === 'openOrders'"
                      >
                        <TairoButtonIcon
                          v-if="item.filled === 0"
                          color="danger"
                          condensed2
                          data-nui-tooltip="Cancel Order"
                          data-nui-tooltip-position="left"
                          @click="cancel(item.uuid)"
                          :disabled="item.filled !== 0 || isCanceling"
                          :loading="isCanceling"
                        >
                          <Icon name="line-md:close" class="h-4 w-4" />
                        </TairoButtonIcon>
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
                      <span>{{ $t('Market') }}:</span>
                      <span>{{ item.symbol }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ $t('Date') }}:</span>
                      <span>{{ formatedDate(item.created_at, true) }}</span>
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
                      <span>{{ $t('Filled') }}:</span>
                      <span>{{ item.filled }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ $t('Status') }}:</span>

                      <div class="flex justify-between items-center gap-2">
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
                        <div v-if="activeFilter === 'openOrders'">
                          <TairoButtonIcon
                            v-if="item.filled === 0"
                            color="danger"
                            condensed2
                            data-nui-tooltip="Cancel Order"
                            data-nui-tooltip-position="left"
                            @click="cancel(item.uuid)"
                            :disabled="item.filled !== 0 || isCanceling"
                            :loading="isCanceling"
                          >
                            <Icon name="line-md:close" class="h-4 w-4" />
                          </TairoButtonIcon>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>
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
