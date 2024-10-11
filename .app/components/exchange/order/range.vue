<script setup lang="ts">
const marketStore = useMarketStore()
const userStore = useUserStore()

const props = defineProps({
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  isLeverage: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
    default: '',
  },
  pair: {
    type: String,
    default: '',
  },
})

const totalRange = computed(() => props.max - props.min)

const percentages = computed(() => {
  return [props.min, ...Array.from({ length: 4 }, (_, i) => 25 * (i + 1))]
})

const isInputDisabled = computed(() => {
  const order = marketStore.order
  const bestAsk = marketStore.bestAsk

  // Check if the user is logged in
  if (!userStore.isLoggedIn) return true

  // Conditions for types other than 'MARKET'
  if (order.type !== 'MARKET') {
    if (order.price === 0 || order.price === null) return true
  }

  // Conditions for 'MARKET' type
  if (order.type === 'MARKET') {
    if (bestAsk === null || bestAsk === 0) return true
  }

  return false
})

const calculatePercentageButton = (percentage: number) => {
  marketStore.order.percentage = Math.round((percentage / props.max) * 100)
}

const calculatePercentage = () => {
  marketStore.order.percentage = Math.round(marketStore.order.percentage)
}

const sliderBackgroundStyle = computed(() => {
  return {
    background: `linear-gradient(to right, #01bc8d 0%, #01bc8d ${marketStore.order.percentage}%, rgb(200 200 200 / 0.2) ${marketStore.order.percentage}%, rgb(200 200 200 / 0.2) 100%)`,
  }
})

const getTextClass = (percentage) => {
  return marketStore.order.percentage >=
    (percentage / totalRange.value) * 100 && marketStore.order.percentage !== 0
    ? 'text-gray-800 dark:text-gray-200'
    : 'text-gray-400 dark:text-gray-500'
}

const getTextStyle = (percentage) => {
  const offset =
    percentage === props.max
      ? '- 10px'
      : percentage !== props.min
        ? '- 4px'
        : ''
  return {
    left: `calc(${(percentage / totalRange.value) * 100}% ${offset})`,
  }
}

const isDotActive = (percentage) => {
  return marketStore.order.percentage >= (percentage / totalRange.value) * 100
}

const getDotStyle = (percentage) => {
  return {
    left: `calc(${(percentage / totalRange.value) * 100}%)`,
  }
}

const percentageText = (percentage) => {
  return `${percentage}${props.isLeverage ? 'x' : '%'}`
}
</script>

<template>
  <div class="group relative ml-2 mr-5">
    <input
      v-model="marketStore.order.percentage"
      :disabled="isInputDisabled"
      type="range"
      class="rc-slider appearance-none relative w-full h-1 rounded-sm transition-opacity duration-200 p-0 m-0"
      :style="sliderBackgroundStyle"
      @change="calculatePercentage"
    />
    <div class="rc-slider-mark absolute top-6 left-0 w-full text-xs">
      <div
        v-for="percentage in percentages"
        :key="percentage"
        class="rc-slider-mark-text absolute inline align-middle text-center cursor-pointer"
        :class="getTextClass(percentage)"
        :style="getTextStyle(percentage)"
        @click.prevent="calculatePercentageButton(percentage)"
      >
        {{ percentageText(percentage) }}
      </div>
    </div>
    <div class="rc-slider-step absolute w-full bg-transparent">
      <div
        v-for="percentage in percentages"
        :key="percentage"
        class="rc-slider-dot absolute bottom-1 w-2.5 h-2.5 border-2 border-gray-400 bg-white cursor-pointer rounded-full align-middle"
        :class="{ 'border-green-500': isDotActive(percentage) }"
        :style="getDotStyle(percentage)"
        @click.prevent="calculatePercentageButton(percentage)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.rc-slider {
  position: relative;
  box-sizing: border-box;
  width: 105%;
  height: 4px;
  outline: none;
  border-radius: 2px;
  transition: opacity 0.2s;
  padding: 0;
  margin: 0;
}
.rc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  position: relative;
  z-index: 3;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 3px solid #01bc8d;
  border-radius: 50%;
  background: #fff;
  margin-top: 0px;
  cursor: pointer;
}

.rc-slider::-moz-range-thumb {
  position: relative;
  z-index: 3;
  width: 16px;
  height: 16px;
  border: 4px solid #1a202c;
  border-radius: 50%;
  background: #01bc8d;
  cursor: pointer;
}
</style>
