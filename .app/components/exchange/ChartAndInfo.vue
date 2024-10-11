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

const activeItem = ref('creatable')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}
const setActive = (menuItem: string) => {
  activeItem.value = menuItem
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 shadow h-full w-full rounded-r-lg">
    <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-r-lg">
      <ul
        id="myTab"
        class="nf flex-cols -mb-px flex overflow-x-hidden text-center"
        role="tablist"
      >
        <li role="presentation">
          <button
            id="creatable-tab"
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            type="button"
            role="tab"
            aria-controls="creatable"
            :aria-selected="isActive('creatable') ? true : false"
            :class="!isActive('creatable') ? 'inactive-tab' : 'active-tab'"
            @click="setActive('creatable')"
          >
            {{ $t('Chart') }}
          </button>
        </li>
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
      </ul>
    </div>
    <div
      class="h-[calc(100%-2rem)] rounded-r-lg"
      :class="{ hidden: !isActive('creatable') }"
      role="tabpanel"
      aria-labelledby="creatable-tab"
    >
      <ExchangeChart :currency="currency" :pair="pair" />
    </div>
    <div
      id="orderbook"
      class="h-[calc(100%-2rem)]"
      :class="{ hidden: !isActive('orderbook') }"
      role="tabpanel"
      aria-labelledby="orderbook-tab"
    >
      <ExchangeOrderBook :currency="currency" :pair="pair" />
    </div>
    <div
      id="trades"
      class="h-[calc(100%-2rem)]"
      :class="{ hidden: !isActive('trades') }"
      role="tabpanel"
      aria-labelledby="trades-tab"
    >
      <ExchangeTrades :currency="currency" :pair="pair" />
    </div>
  </div>
</template>
