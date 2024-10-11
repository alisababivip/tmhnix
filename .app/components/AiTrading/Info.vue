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

const activeItem = ref('orderbook')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}
const setActive = (menuItem: string) => {
  activeItem.value = menuItem
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 h-full shadow w-full">
    <div class="w-full bg-gray-100 dark:bg-gray-800">
      <ul
        id="myTab"
        class="nf flex-cols -mb-px flex overflow-x-hidden text-center"
        role="tablist"
      >
        <li role="presentation">
          <button
            id="orderbook-tab"
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            role="tab"
            aria-controls="orderbook"
            :aria-selected="isActive('orderbook') ? true : false"
            :class="!isActive('orderbook') ? 'inactive-tab' : 'active-tab'"
            @click="setActive('orderbook')"
          >
            {{ $t('Orderbook') }}
          </button>
        </li>
        <li role="presentation">
          <button
            id="trades-tab"
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            role="tab"
            aria-controls="trades"
            :aria-selected="isActive('trades') ? true : false"
            :class="!isActive('trades') ? 'inactive-tab' : 'active-tab'"
            @click="setActive('trades')"
          >
            {{ $t('Trades') }}
          </button>
        </li>
        <li role="presentation">
          <button
            id="orders-tab"
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            role="tab"
            aria-controls="orders"
            :aria-selected="isActive('orders') ? true : false"
            :class="!isActive('orders') ? 'inactive-tab' : 'active-tab'"
            @click="setActive('orders')"
          >
            {{ $t('Orders') }}
          </button>
        </li>
      </ul>
    </div>
    <div
      id="orderbook"
      class="pt-1 relative overflow-y-auto h-full"
      :class="{ hidden: !isActive('orderbook') }"
      role="tabpanel"
      aria-labelledby="orderbook-tab"
    >
      <ExchangeOrderBook :currency="currency" :pair="pair" />
    </div>
    <div
      id="trades"
      class="pt-1 relative h-full"
      :class="{ hidden: !isActive('trades') }"
      role="tabpanel"
      aria-labelledby="trades-tab"
    >
      <ExchangeTrades :currency="currency" :pair="pair" />
    </div>
    <div
      id="orders"
      class="pt-1 relative h-full"
      :class="{ hidden: !isActive('orders') }"
      role="tabpanel"
      aria-labelledby="orders-tab"
    >
      <ExchangeOrders
        class="h-full bg-white dark:bg-gray-900 rounded-tr-lg shadow"
      />
    </div>
  </div>
</template>
