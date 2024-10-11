<template>
  <template v-for="(item, index) in data">
    <div
      v-if="data && data.length > 0"
      :key="index"
      class="orderbook-item hover:bg-gray-100 dark:hover:bg-gray-800"
      :style="`height: ${showDepth ? 11 : 24}px;line-height: ${
        showDepth ? 8 : 24
      }px;`"
      @click="
        marketStore.setOrderData(item[0], type === 'bid' ? 'SELL' : 'BUY')
      "
    >
      <div
        v-if="!showDepth || (showDepth && [2, 5, 10, 15, 18].includes(index))"
        class="price"
        :class="
          parseFloat(item[1]) > 0
            ? type === 'bid'
              ? 'text-success-500 dark:text-success-400'
              : 'text-danger-500'
            : 'text-gray-300 dark:text-gray-500'
        "
      >
        {{ item[0] }}
      </div>
      <div
        v-if="!showDepth && $viewport.isGreaterOrEquals('xs')"
        class="quantity"
        :class="
          parseFloat(item[1]) > 0
            ? 'text-dark'
            : 'text-gray-300 dark:text-gray-500'
        "
      >
        {{ item[1] }}
      </div>
      <div
        class="total"
        :class="
          parseFloat(item[2]) > 0
            ? 'text-dark'
            : 'text-gray-300 dark:text-gray-500'
        "
      >
        <span v-if="!showDepth"> {{ item[2] }}</span>
        <div
          class="progress trasition-all duration-300 ease-in-out percent"
          :class="{
            'bg-success-300/40': type === 'bid' && showDepth,
            'bg-danger-500/40': type === 'ask' && showDepth,
            'bg-success-300/20': type === 'bid' && !showDepth,
            'bg-danger-500/20': type === 'ask' && !showDepth,
            'left-0': $viewport.isLessThan('md') && type === 'bid',
          }"
          :style="'width:' + item[3] + 'px'"
        ></div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: '',
  },
  showLess: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '',
  },
  showDepth: {
    type: Boolean,
    default: false,
  },
})

const marketStore = useMarketStore()
</script>

<style scoped>
.orderbook-item {
  display: flex;
  justify-content: space-between;
  position: relative;
  font-size: 12px;
  width: 100%; /* Make sure the item takes full width of the container */
}

.price {
  width: 30%;
  text-align: left; /* Align text to the left */
  flex: 1 1 0%;
  cursor: pointer;
}

.quantity,
.total {
  width: 30%;
  text-align: right;
  flex: 1 1 0%;
  cursor: pointer;
}

.total {
  width: 40%;
  padding-right: 5px;
}

.percent {
  position: absolute;
  top: 0;
  height: 100%;
  bottom: 0;
  right: 0;
}
.price span {
  padding-left: 5px;
}

.percent.left-0 {
  right: auto;
  left: 0;
}
</style>
