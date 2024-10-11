<script setup lang="ts">
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
import type { EcosystemOrderSide } from '~~/types'
const ecoSocketStore = useEcosystemSocketStore()

type Trade = {
  side: EcosystemOrderSide
  price: string
  amount: string
  time: string
  class: string
}

const trades: Ref<Trade[]> = ref([])

const marketStore = useMarketStore()

const activeItem = ref('recentTrades')
const isActive = (menuItem: string) => {
  return activeItem.value === menuItem
}
const setActive = (menuItem: string) => {
  activeItem.value = menuItem
}

const pricePrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.price) || 4
  return Math.abs(precision)
})

const amountPrecision = computed(() => {
  const precision =
    Number(marketStore.selectedMarket?.metadata?.precision?.amount) || 4
  return Math.abs(precision)
})

const worker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
const priceFormatter = (value, precision) => {
  if (isNaN(value) || value === null) return '0';
  const formattedValue = parseFloat(value).toFixed(precision || 5);
  return formattedValue;
};

function processTradesData(tradesData, precision) {
  if (tradesData === undefined || tradesData === null) {
    return [];
  }

  return tradesData.map((trade) => {
    const pricePrecision = precision.price || 5;
    const amountPrecision = precision.amount || 3;

    const price = trade.price
      ? priceFormatter(trade.price, pricePrecision)
      : '0';

    const sizeOrAmount = trade.amount
    const amount = sizeOrAmount
      ? priceFormatter(sizeOrAmount, amountPrecision)
      : '0';

    const time = new Date(trade.timestamp).toLocaleTimeString();
    const side = trade.side || '';

    return {
      price,
      amount,
      time,
      class: side === "SELL" ? "text-danger-500" : "text-success-500 dark:text-success-400",
    };
  });
}

self.onmessage = function (event) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error("Failed to parse incoming data", e);
    return;
  }

  const { rawData, precision } = data;

  const result = processTradesData(rawData, precision);
  self.postMessage(result);
};

        `,
      ],
      { type: 'text/javascript' },
    ),
  ),
)
watch(
  () => ecoSocketStore.orders,
  (updatedOrder) => {
    if (!updatedOrder || !updatedOrder.uuid) {
      return
    }

    let tradesData = []
    try {
      tradesData =
        typeof updatedOrder.trades === 'string'
          ? JSON.parse(updatedOrder.trades)
          : updatedOrder.trades
    } catch (e) {
      console.error('Failed to parse trades data', e)
      return
    }

    const precision = {
      price: pricePrecision.value,
      amount: amountPrecision.value,
    }

    const message = {
      rawData: tradesData,
      precision,
    }
    worker.postMessage(JSON.stringify(message))
  },
  { immediate: true },
)

worker.onmessage = function (event) {
  // Prepend the new trades to the existing trades
  trades.value = [...event.data, ...trades.value]

  // Limit the trades to 50 and remove the last item if necessary
  if (trades.value.length > 50) {
    trades.value = trades.value.slice(0, 50)
  }
}

const handleClose = () => {
  worker.terminate()
}

onMounted(() => {
  window.addEventListener('beforeunload', handleClose)
})

onBeforeUnmount(() => {
  handleClose()
  window.removeEventListener('beforeunload', handleClose)
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 shadow relative h-full w-full"
    :class="{
      'rounded-tl-lg': $viewport.isGreaterOrEquals('sm'),
    }"
  >
    <div
      class="w-full bg-gray-100 dark:bg-gray-800 rounded-tl-lg"
      v-if="$viewport.isGreaterOrEquals('sm')"
    >
      <ul
        id="myTab"
        class="nf flex-cols -mb-px flex overflow-x-hidden text-center rounded-tl-lg"
        role="tablist"
      >
        <li class="mr-2">
          <a
            id="recentTrades-tab"
            class="inline-block py-2 pl-3 pr-4 text-xs font-medium"
            :class="!isActive('recentTrades') ? 'inactive-tab' : 'active-tab'"
            type="button"
            role="tab"
            aria-controls="recentTrades"
            aria-selected="false"
            @click.prevent="setActive('recentTrades')"
          >
            {{ $t('Recent Trades') }}</a
          >
        </li>
      </ul>
    </div>
    <div id="tradesContent" class="trades-content">
      <div
        v-if="isActive('recentTrades')"
        id="recentTrades"
        class="trades-grid"
        :class="{
          'px-3 pt-2': $viewport.isGreaterOrEquals('sm'),
          'px-2 pt-1': $viewport.isLessThan('sm'),
        }"
      >
        <div class="trades-header">
          <div class="text-start w-2/5">{{ $t('Price') }}</div>
          <div class="text-start w-1/5">{{ $t('Amount') }}</div>
          <div class="text-end w-2/5">{{ $t('Time') }}</div>
        </div>
        <div
          v-if="trades.length > 0"
          class="trades-body overflow-y-scroll no-scrollbar"
          :class="{
            'h-[calc(23.5vh)]': $viewport.isGreaterOrEquals('sm'),
            'h-[calc(25vh)]': $viewport.isLessThan('sm'),
          }"
        >
          <div
            v-for="(item, index) in trades"
            :key="index"
            class="trade-item hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div class="text-start w-2/5" :class="item.class">
              {{ item.price }}
            </div>
            <div class="text-start w-1/5">{{ item.amount }}</div>
            <div class="text-end w-2/5">{{ item.time }}</div>
          </div>
        </div>
        <div v-else class="no-trades text-center">
          {{ $t('No trades yet') }}.
        </div>
      </div>
    </div>
  </div>
</template>

<style scope>
.trades-header,
.trade-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 2px;
}

.trades-content {
  font-size: 12px;
}

.trades-grid {
  display: grid;
}

.no-trades {
  padding: 20px;
}
</style>
