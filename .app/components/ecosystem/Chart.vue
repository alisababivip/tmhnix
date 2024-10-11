<script setup lang="ts">
import dayjs from 'dayjs'
import { widget as TradingView } from '~~/plugins/charting_library'
import { useEcosystemSocketStore } from '~~/store/extensions/ecosystem/socket'
const ecoSocketStore = useEcosystemSocketStore()
const props = defineProps({
  currency: {
    type: String,
    required: true,
  },
  pair: {
    type: String,
    required: true,
  },
  isBinary: {
    type: Boolean,
    required: false,
  },
}) as any

const { getHistorical, cancelOrder } = useEcosystem()
const { toast } = useUtils()
const provider = 'ecosystem'

const {
  supported_resolutions_provider,
  resolutionMap_provider,
  disabled_features,
  enabled_features,
  lightColors,
  darkColors,
  calculateRemainingSeconds,
  calculateRemainingTime,
  extractBinaryOrderData,
} = useChart()

const marketStore = useMarketStore()
const settingsStore = useSettingsStore()
const walletStore = useWalletStore()
const userStore = useUserStore()
const chartReady = ref(false)
const darkModeStore = useDarkModeStore()
const cutPercentage = ref(0)
const isCancelOpen = ref(false)
const isLoading = ref(false)
const selectedOrder: any = ref(null)
const settings = computed(() => settingsStore.settings)
const route = useRoute()
const isPractice = computed(() => route.query.isPractice === 'true')
const selectedOrderRemaininTime = computed(() => {
  if (!selectedOrder.value) return 0
  return calculateRemainingSeconds(selectedOrder.value)
})

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

const selectedOrderRefund = computed(() => {
  if (!selectedOrder.value) return null
  if (selectedOrderRemaininTime.value <= 15) return null
  const cutAmount =
    selectedOrder.value?.amount * (Math.abs(cutPercentage.value) / 100)
  return (selectedOrder.value?.amount - cutAmount).toFixed(
    amountPrecision.value,
  )
})
onMounted(async () => {
  updateProviderSettings(provider)
  initTradingView()

  if (userStore.isLoggedIn) {
    if (props.isBinary && marketStore.binaryPositions.length === 0) {
      await marketStore.fetchBinaryPositions()
    }
  }

  window.addEventListener('beforeunload', handleClose)
})

onBeforeUnmount(() => {
  worker.terminate()
  if (widget) {
    try {
      // If widget has a destroy or remove method, call it
      if (typeof widget.remove === 'function') {
        widget.remove()
      }
    } catch (e) {
      console.error('Error destroying widget:', e)
    } finally {
      widget = null
    }
  }

  const existingChartContainer = document.getElementById('tv_chart_container')
  if (existingChartContainer) {
    existingChartContainer.remove()
  }
  window.removeEventListener('beforeunload', handleClose)
})

const handleClose = () => {
  worker.terminate()
  if (widget) {
    try {
      // If widget has a destroy or remove method, call it
      if (typeof widget.remove === 'function') {
        widget.remove()
      }
    } catch (e) {
      console.error('Error destroying widget:', e)
    } finally {
      widget = null
    }
  }

  const existingChartContainer = document.getElementById('tv_chart_container')
  if (existingChartContainer) {
    existingChartContainer.remove()
  }
  worker.terminate()
}

let worker = createWorker()
let widget: any = null
let resolutionMap: any = null
let supported_resolutions: any = null

supported_resolutions = supported_resolutions_provider[provider]

resolutionMap = resolutionMap_provider[provider]

const state: any = ref({
  interval: null,
  ws: null,
  since: null,
  duration: 86400000,
  now: Date.now(),
  lastprice: [],
  subscribers: {},
})

const viewport = useViewport()
if (viewport.isGreaterOrEquals('sm')) {
  enabled_features.push('chart_style_hilo')
  enabled_features.push('chart_style_hilo_last_price')
  enabled_features.push('side_toolbar_in_fullscreen_mode')
} else {
  disabled_features.push('left_toolbar')
  disabled_features.push('header_fullscreen_button')
  disabled_features.push('timeframes_toolbar')
}

// Update the supported resolutions and resolutionMap based on the provider
function updateProviderSettings(provider: string) {
  supported_resolutions = supported_resolutions_provider[provider] || []
  resolutionMap = resolutionMap_provider[provider] || {}
}

function initTradingView() {
  const tvChartContainer = document.getElementById('tv_chart_container')
  if (!tvChartContainer) {
    const newChartContainer = document.createElement('div')
    newChartContainer.id = 'tv_chart_container'
    newChartContainer.style.height = '100%'

    const creatable = document.querySelector('#creatable') as HTMLElement
    creatable.appendChild(newChartContainer)
  }
  var symbol = props.currency + '/' + props.pair
  const tvWidget = new TradingView({
    // debug: true,
    fullscreen: false,
    autosize: true,
    symbol: symbol,
    interval: '1' as any,
    container: 'tv_chart_container',
    datafeed: datafeed as any,
    library_path: '/charting_library/',
    locale: 'en',
    theme: isDarkMode.value ? 'Dark' : 'Light',
    timezone: 'Etc/UTC',
    client_id: 'chart',
    disabled_features: disabled_features as any,
    enabled_features: enabled_features as any,
    overrides: {
      'mainSeriesProperties.showCountdown': true,
      'highLowAvgPrice.highLowPriceLinesVisible': true,
      'mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible': true,
      'mainSeriesProperties.showPriceLine': true,
    },
  })

  widget = tvWidget

  widget.onChartReady(() => {
    chartReady.value = true
    createPositionLines()
  })
}

const lastBar = ref({}) as any
let timeoutId: any = null

let datafeed = {
  onReady: function (cb: any) {
    setTimeout(
      () =>
        cb({
          exchanges: [],
          symbols_types: [],
          supported_resolutions: supported_resolutions,
        }),
      0,
    )
  },

  resolveSymbol: function (
    symbolName: any,
    onSymbolResolvedCallback: any,
    onResolveErrorCallback: any,
  ) {
    setTimeout(() => {
      onSymbolResolvedCallback({
        data_status: 'streaming',
        pricescale: Math.pow(10, Number(pricePrecision.value) || 2),
        name: symbolName,
        full_name: symbolName,
        description: symbolName,
        ticker: symbolName,
        type: 'crypto',
        session: '24x7',
        format: 'price',
        exchange: settings.value?.site_name?.toUpperCase() || 'Platform',
        listed_exchange: settings.value?.site_name?.toUpperCase() || 'Platform',
        timezone: 'Etc/UTC',
        volume_precision: amountPrecision.value || 2,
        supported_resolutions: supported_resolutions,
        minmov: 1,
        has_intraday: true,
        visible_plots_set: false,
      })
    }, 0)
  },

  getBars: async function (
    symbolInfo: any,
    resolution: any,
    periodParams: any,
    onHistoryCallback: any,
    onErrorCallback: any,
  ) {
    const from = periodParams.from * 1000
    const to = periodParams.to * 1000

    try {
      const response = await getHistorical(
        symbolInfo.ticker,
        from,
        to,
        resolutionMap[resolution],
      )

      const data: Bar[] = response.data.result.map((item: any) => ({
        ...item,
        time: normalizeTimeToInterval(
          new Date(item.updated_at).getTime(),
          resolutionMap[resolution],
        ),
      }))

      const filledBars = fillMissingBars(data, resolutionMap[resolution])

      if (filledBars.length) {
        if (props.isBinary) {
          marketStore.bestAsk = filledBars[filledBars.length - 1].close
          setProfit(filledBars[filledBars.length - 1].close)
        }

        onHistoryCallback(filledBars)
      } else {
        onHistoryCallback([], { noData: true })
      }
    } catch (error) {
      onErrorCallback(new Error('Failed to fetch historical data'))
    }
  },

  subscribeBars: function (
    symbolInfo: any,
    resolution: any,
    onRealtimeCallback: any,
    subscribeUID: any,
    onResetCacheNeededCallback: any,
  ) {
    // Store the subscriber's callback and symbol information in a global map
    const subscriberInfo = {
      callback: onRealtimeCallback,
      symbolInfo: symbolInfo,
      resolution: resolution,
    }
    state.value.subscribers[subscribeUID] = subscriberInfo

    // If the interval has changed, unsubscribe from the old interval and subscribe to the new one
    if (
      state.value.interval !== resolutionMap[resolution] ||
      !state.value.interval
    ) {
      // Update the interval
      state.value.interval = resolutionMap[resolution]

      // Subscribe to the new interval
      ecoSocketStore.subscribe('exchange', {
        method: 'candles',
        symbol: `${props.currency}/${props.pair}`,
        interval: state.value.interval,
      })

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const timeoutCallback = () => {
        const newBar = createEmptyBar(
          normalizeTimeToInterval(Date.now(), resolutionMap[resolution]),
          lastBar.value.close,
        )

        Object.values(state.value.subscribers).forEach(
          (subscriberInfo: any) => {
            if (subscriberInfo.callback) {
              subscriberInfo.callback(newBar)
            }
          },
        )
        timeoutId = setTimeout(
          timeoutCallback,
          normalizeTimeToInterval(Date.now(), resolutionMap[resolution]) +
            intervalToMs(resolutionMap[resolution]) -
            Date.now(),
        )
      }
      timeoutCallback()
    }
  },

  unsubscribeBars: function (subscriberUID: any) {
    if (!state.value.subscribers[subscriberUID]) return
    // Remove the subscriber from the global map
    delete state.value.subscribers[subscriberUID]

    // Unsubscribe from the current interval
    if (state.value.interval) {
      ecoSocketStore.unsubscribe('exchange', {
        method: 'candles',
        symbol: `${props.currency}/${props.pair}`,
        interval: state.value.interval,
      })
    }

    // Reset the interval
    state.value.interval = null
  },
}

type Bar = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const cache = ref<Bar[]>([])

function fillMissingBars(inputBars: Bar[], interval: string): Bar[] {
  if (inputBars.length === 0) return []

  const filledBars: Bar[] = []
  inputBars.sort((a, b) => a.time - b.time)

  let lastBarTime = inputBars[0].time // Start with the time of the first bar
  let lastClosePrice = inputBars[0].close // Start with the close price of the first bar
  const intervalMs = intervalToMs(interval)

  for (const bar of inputBars) {
    // Fill in any missing bars between the last bar and this one
    for (
      let missingTime = lastBarTime + intervalMs;
      missingTime < bar.time;
      missingTime += intervalMs
    ) {
      const missingBar = createEmptyBar(missingTime, lastClosePrice)
      filledBars.push(missingBar)
    }

    // Add the current bar
    filledBars.push(bar)

    // Update the lastBarTime and lastClosePrice
    lastBarTime = bar.time
    lastClosePrice = bar.close
  }

  // Fill in any missing bars up to the current time
  const currentTime = normalizeTimeToInterval(Date.now(), interval)

  for (
    let missingTime = lastBarTime + intervalMs;
    missingTime <= currentTime;
    missingTime += intervalMs
  ) {
    const missingBar = createEmptyBar(missingTime, lastClosePrice)
    filledBars.push(missingBar)
  }
  lastBar.value = filledBars[filledBars.length - 1]

  return filledBars
}

function createEmptyBar(time: number, closePrice: number): Bar {
  return {
    time: time,
    open: closePrice,
    high: closePrice,
    low: closePrice,
    close: closePrice,
    volume: 0,
  }
}

function intervalToMs(interval: string): number {
  const units = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  }

  const unit = interval.slice(-1)
  const value = parseInt(interval.slice(0, -1), 10)

  return units[unit] * value
}

// Your WebSocket message handler
watch(
  () => ecoSocketStore.candles,
  (newData) => {
    if (!newData) return

    try {
      const serializableData = JSON.stringify(newData)
      worker.postMessage(serializableData)
    } catch (e) {
      console.error('Failed to post message to worker: ', e)
    }
  },
  { immediate: true },
)

function normalizeTimeToInterval(timestamp: number, interval: string): number {
  const date = dayjs(timestamp)

  switch (interval.slice(-1)) {
    case 'm':
      return date.startOf('minute').valueOf()
    case 'h':
      return date.startOf('hour').valueOf()
    case 'd':
      return date.startOf('day').valueOf()
    case 'w':
      return date.startOf('week').valueOf()
    default:
      throw new Error(`Invalid interval: ${interval}`)
  }
}

function createWorker() {
  return new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
self.onmessage = function (event) {
  const watchOHLCV = JSON.parse(event.data);

  if (watchOHLCV === undefined || watchOHLCV === null) {
    return;
  }

  const processedData = {
    time: new Date(watchOHLCV.updated_at).getTime(),
    open: watchOHLCV.open,
    high: watchOHLCV.high,
    low: watchOHLCV.low,
    close: watchOHLCV.close,
    volume: watchOHLCV.volume,
  };

  self.postMessage(processedData);
};
        `,
        ],
        { type: 'text/javascript' },
      ),
    ),
  )
}

watch(
  () => ecoSocketStore.candles,
  (newData) => {
    if (!newData) return

    try {
      const serializableData = JSON.stringify(newData)
      worker.postMessage(serializableData)
    } catch (e) {
      console.error('Failed to post message to worker: ', e)
    }
  },
  { immediate: true },
)

// Listen for messages from the worker...
worker.onmessage = (event) => {
  // The data returned from the worker...
  let newBar = event.data
  if (!newBar) {
    return
  }

  if (props.isBinary) {
    marketStore.bestAsk = newBar.close
    setProfit(newBar.close)
  }
  // Iterate through all subscribers and send updates
  Object.values(state.value.subscribers).forEach((subscriberInfo: any) => {
    if (subscriberInfo.callback) {
      subscriberInfo.callback(newBar)
    }
  })
  lastBar.value = newBar
}

watch(
  () => marketStore.binaryExpirationTimes[0],
  (newTime) => handleBinaryExpirationTime(newTime as any),
)

function handleBinaryExpirationTime(newTime: string) {
  const remainingSeconds = calculateRemainingSeconds(newTime)
  if (remainingSeconds <= 0) {
    processPositionLines()
  } else {
    updatePositionLines()
  }
}

function processPositionLines() {
  for (const [key, value] of positionLines.value.entries()) {
    const orderRemainingSeconds = calculateRemainingSeconds(
      value.order.closed_at,
    )

    if (orderRemainingSeconds <= 0) {
      if (value.isProcessing) continue

      initiateProcessingOrder(value, key)
    } else {
      updatePositionLine(value)
    }
  }
}

function initiateProcessingOrder(value: any, key: string) {
  let processingCounter = 0
  value.isProcessing = true

  // Set up a temporary interval to update the text
  const processingInterval: any = setInterval(async () => {
    processingCounter += 1
    const processingText = 'Processing' + '.'.repeat(processingCounter % 4)
    value.line.setText(processingText)

    await checkAndUpdateOrderStatus(value.order, processingInterval, key)
  }, 1000)
}

async function checkAndUpdateOrderStatus(
  order: any,
  processingInterval: number,
  key: string,
) {
  if (isPractice.value === order.is_demo) {
    await marketStore.fetchBinaryPositions()
    const updatedOrder = marketStore.binaryPositions.find(
      (o) => o.uuid === order.uuid && o.is_demo === isPractice.value,
    )

    if (updatedOrder && updatedOrder.status !== 'PENDING') {
      clearInterval(processingInterval)
      notifyProfit(updatedOrder)
      try {
        positionLines.value.get(key)?.line.remove() // Remove the line from the chart
        positionLines.value.delete(key) // Delete the line information from the map
      } catch (error) {}
    }
  }
}

function updatePositionLines() {
  positionLines.value.forEach((value) => updatePositionLine(value))
}

function updatePositionLine(value: any) {
  const remainingTime = calculateRemainingTime(value.order)
  value.remainingTime = remainingTime
  const text = generateContractText(value)
  value.line.setText(text)
}

function notifyProfit(order: any) {
  let notifyClass, profit, message
  switch (order.status) {
    case 'WIN':
      profit = order.amount * (Number(order.profit) / 100)
      message = `Congratulations! You won ${profit} ${props.pair}.`
      walletStore.wallets[props.pair].balance += profit + order.amount
      toast.successText(message)
      break
    case 'LOSS':
      profit = -order.amount
      message = `Sorry! You lost ${profit} ${props.pair}.`
      toast.dangerText(message)
      break
    case 'DRAW':
      message = `Your order was a draw. You didn't win or lose anything.`
      walletStore.wallets[props.pair].balance += order.amount
      toast.muted(message)
      break
  }
  selectedOrder.value = null
  isCancelOpen.value = false
  isLoading.value = false
}

const positionLines = ref<
  Map<
    string,
    {
      line: any
      symbol: string
      order: any
      profit?: number
      percentage?: number
      remainingTime?: number
      isProcessing?: boolean
      loss?: number
    }
  >
>(new Map())

watch(
  () =>
    props.isBinary
      ? marketStore.binaryPositions.length
      : marketStore.orders.length,
  () => {
    if (chartReady.value) {
      createPositionLines()
    }
  },
  { immediate: true },
)

function calculateProfitAndPercentage(order: any, newBestAsk: number) {
  if (props.isBinary) {
    return calculateBinaryOrderProfit(order, newBestAsk)
  }
  return calculateNonBinaryOrderProfit(order, newBestAsk)
}

function calculateBinaryOrderProfit(order: any, newBestAsk: number) {
  if (newBestAsk === order.price) {
    return handleDrawCase()
  }

  const { totalTime, remainingTime, isRiseOrder, priceChange } =
    extractBinaryOrderData(order, newBestAsk)
  let profitPercentage = calculateProfitPercentageForBinaryOrder(
    isRiseOrder,
    newBestAsk,
    order.price,
    totalTime,
    remainingTime,
    priceChange,
  )

  return finalizeProfitCalculation(order.amount, profitPercentage)
}

function handleDrawCase() {
  const profit = 0
  const profitPercentage = 0
  cutPercentage.value = profitPercentage
  return { profit, profitPercentage }
}

function calculateProfitPercentageForBinaryOrder(
  isRiseOrder: boolean,
  newBestAsk: number,
  orderPrice: number,
  totalTime: number,
  remainingTime: number,
  priceChange: number,
) {
  const winTimeFactor =
    settings.value?.binary_trading_profit_percentage / totalTime
  const lossTimeFactor = 100 / totalTime
  const priceChangeFactor = 1 + Math.abs(priceChange / 100)
  let profitPercentage

  if (remainingTime <= 15) {
    profitPercentage =
      newBestAsk > orderPrice
        ? settings.value?.binary_trading_profit_percentage
        : -100
    if (!isRiseOrder) {
      profitPercentage = -profitPercentage
    }
  } else {
    const timeSpent = totalTime - remainingTime
    profitPercentage = isRiseOrder
      ? newBestAsk > orderPrice
        ? winTimeFactor * timeSpent
        : -lossTimeFactor * timeSpent
      : newBestAsk < orderPrice
      ? winTimeFactor * timeSpent
      : -lossTimeFactor * timeSpent

    profitPercentage *= priceChangeFactor
  }

  return Math.min(
    Math.max(profitPercentage, -100),
    settings.value?.binary_trading_profit_percentage,
  )
}

function finalizeProfitCalculation(
  orderAmount: number,
  profitPercentage: number,
) {
  let profit = (orderAmount * profitPercentage) / 100
  profit = Number(profit.toFixed(2))
  profitPercentage = Number(profitPercentage.toFixed(2))
  cutPercentage.value = profitPercentage
  return { profit, profitPercentage }
}

function calculateNonBinaryOrderProfit(order: any, newBestAsk: number) {
  const priceDifference =
    order.side === 'SELL' ? order.price - newBestAsk : newBestAsk - order.price
  let profitPercentage = (priceDifference / order.price) * 100

  return finalizeProfitCalculation(order.amount, profitPercentage)
}

function createLine(
  order: any,
  lineColor: string,
  isStopLine: boolean = false,
) {
  const positionLine = widget.chart().createPositionLine()

  // Common settings for both main order line and stop price line
  positionLine
    .setText(isStopLine ? 'Stop Price' : 'Pending')
    .setPrice(order.price)
    .setExtendLeft(true)
    .setLineStyle(0)
    .setLineLength(50)
    .setLineColor(lineColor)
    .setBodyTextColor('#ffffff')
    .setBodyBackgroundColor(`${lineColor}${isDarkMode.value ? '50' : '80'}`)
    .setBodyBorderColor(lineColor)
    .setQuantity(order.amount.toString())
    .setQuantityBorderColor(lineColor)
    .setQuantityBackgroundColor(`${lineColor}${isDarkMode.value ? '50' : '80'}`)

  // If it's the main order line, add the cancel button
  if (!isStopLine) {
    positionLine
      .onClose('onClose called', async function (text: string) {
        try {
          if (props.isBinary) {
            const currentTime = new Date().getTime()
            const closeAtTime = new Date(order.closed_at).getTime()

            if (closeAtTime - currentTime > 15 * 1000) {
              selectedOrder.value = order
              isCancelOpen.value = true
            } else {
              toast.warning('Cannot cancel order in the last 15 seconds')
            }
          } else {
            const response = await cancelOrder(order.uuid)
            toast.response(response)
          }
        } catch (error) {
          toast.danger(error as any)
        }
      })
      .setCloseTooltip('Cancel Order')
      .setCloseButtonBackgroundColor(
        `${activeColors.value.failure}${isDarkMode.value ? '50' : '80'}`,
      )
      .setCloseButtonBorderColor(activeColors.value.failure)
      .setCloseButtonIconColor(activeColors.value.failure)
  }

  return positionLine
}

async function cancelBinartOrder() {
  try {
    const response = await marketStore.cancelBinaryPosition(
      selectedOrder.value?.uuid,
      cutPercentage.value,
    )
    toast.successText('Order cancelled successfully')
    if (!selectedOrder.value?.is_demo) {
      let refundAmount = selectedOrder.value?.amount
      if (cutPercentage.value < 0) {
        const cutAmount =
          selectedOrder.value?.amount * (Math.abs(cutPercentage.value) / 100)
        refundAmount -= cutAmount
      }
      walletStore.wallets[props.pair].balance += refundAmount
    }
  } catch (error) {
    toast.danger(error as any)
  }
  isCancelOpen.value = false
  selectedOrder.value = null
}

function createPositionLines() {
  if (!chartReady.value) return

  // Get the current orders from the market store
  let orders = props.isBinary ? marketStore.binaryPositions : marketStore.orders

  // Apply filter based on isPractice query
  if (isPractice.value && props.isBinary) {
    orders = orders.filter((order) => order.is_demo)
  }

  // Create a set of order UUIDs to quickly check if an order exists
  const orderUUIDs = new Set(orders.map((order) => order.uuid))

  // Iterate through the existing position lines and remove lines for orders that have been removed
  for (const [uuid, value] of positionLines.value.entries()) {
    if (!orderUUIDs.has(uuid)) {
      try {
        value.line.remove()
        positionLines.value.delete(uuid) // Remove the line from the map
      } catch (error) {}
    }
  }

  // Iterate through the orders and create position lines for new orders
  orders.forEach((order: any) => {
    // Check if a position line already exists for this order
    if (!positionLines.value.has(order.uuid)) {
      // Check if the order is FILLED and has the same symbol
      if (
        order.status === 'PENDING' &&
        order.symbol === props.currency + '/' + props.pair
      ) {
        // const lineColor = order.side === 'BUY' ? successColor : failureColor
        const line = createLine(order, activeColors.value.pending)

        // Calculate profit and percentage
        const { profit: calculatedProfit, profitPercentage } =
          calculateProfitAndPercentage(order, marketStore.bestAsk)

        positionLines.value.set(order.uuid, {
          line,
          symbol: order.symbol,
          order,
          profit: calculatedProfit,
          percentage: profitPercentage,
          remainingTime: calculateRemainingTime(order), // You'll need to define this function
          isProcessing: false,
        })
        if (order.type === 'STOP_LIMIT') {
          const stopLine = createLine(
            { ...order, price: order.stop },
            activeColors.value.stop,
            true,
          )

          positionLines.value.set(`stop-${order.uuid}`, {
            line: stopLine,
            symbol: order.symbol,
            order,
          })
        }

        if (props.isBinary && marketStore.bestAsk) {
          setProfit(marketStore.bestAsk)
        }
      }
    }
  })
}

function generateContractText(lineInfo: {
  profit: number
  percentage: number
  remainingTime: number
  isProcessing: boolean
}) {
  if (lineInfo.isProcessing) {
    return 'Processing'
  }
  if (viewport.isGreaterOrEquals('sm')) {
    return `Profit: ${lineInfo.profit} ${props.pair}, Percentage: ${lineInfo.percentage}%, Remaining Time: ${lineInfo.remainingTime}s`
  } else {
    return `Remaining Time: ${lineInfo.remainingTime}s`
  }
}

function setProfit(newBestAsk: number) {
  // Iterate through the position lines
  positionLines.value.forEach((value, key) => {
    const { line, symbol, order, isProcessing } = value

    // Check if the symbol matches and if the position is not in processing state
    if (symbol === props.currency + '/' + props.pair && !isProcessing) {
      // Calculate profit and profit percentage
      const { profit, profitPercentage } = calculateProfitAndPercentage(
        order,
        newBestAsk,
      )

      // Update the profit, percentage, and remaining time in the position lines map
      value.profit = profit
      value.percentage = profitPercentage
      value.remainingTime = calculateRemainingTime(order)

      // Generate the contract-like text for this line using the helper function
      const newText = generateContractText(value)

      let color
      if (props.isBinary) {
        if (profit > 0) {
          color = activeColors.value.success
        } else if (profit < 0) {
          color = activeColors.value.failure
        } else {
          color = activeColors.value.draw // Draw color for draw case
        }

        // Set the colors for binary orders
        line.setLineColor(color)
        line.setBodyBackgroundColor(`${color}80`)
        line.setBodyBorderColor(color)
        line.setQuantityBorderColor(color)
        line.setQuantityBackgroundColor(`${color}50`)
        line.setCloseButtonBorderColor(color)
      } else {
        color =
          profit > 0 ? activeColors.value.success : activeColors.value.failure
      }
      line.setText(newText)
    }
  })
}

const isDarkMode = computed(() => darkModeStore.isDarkMode)

// Initialize with light mode colors
const activeColors = ref(lightColors)

// Watch for changes in the dark mode setting
watch(isDarkMode, (newDarkMode) => {
  // Change widget theme if applicable
  if (widget) {
    widget.changeTheme(newDarkMode ? 'Dark' : 'Light')
  }

  // Switch to the appropriate color set
  activeColors.value = newDarkMode ? darkColors : lightColors
})
</script>

<template>
  <div class="h-full w-full" id="creatable">
    <div id="tv_chart_container" class="tv_chart_container"></div>
    <TairoModal :open="isCancelOpen" size="sm" @close="isCancelOpen = false">
      <!-- Deletion confirmation UI -->
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
            class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Cancel Order') }}
          </h3>
          <BaseButtonClose @click="isCancelOpen = false" />
        </div>
      </template>
      <div class="p-4 md:p-6">
        <div class="mx-auto w-full text-center">
          <h3
            class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
          >
            {{ $t('Are you sure?') }}
          </h3>
          <span
            class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"
          >
            <div v-if="selectedOrderRefund !== null" :key="selectedOrderRefund">
              <div>
                {{ $t('Do you really want to cancel this') }} {{ $t('order') }}
                {{ $t('This process cannot be undone') }}.
              </div>
              <div>
                {{ $t('You will receive a refund of') }}
                <span
                  :class="`text-${
                    cutPercentage > 0 ? 'success' : 'danger'
                  }-500`"
                  >{{
                    cutPercentage > 0
                      ? selectedOrder?.amount
                      : selectedOrderRefund
                  }}
                  {{ pair }}</span
                >
              </div>
            </div>
            <div v-else>
              <div>{{ $t('You cannot cancel this order now') }}.</div>
              <div>
                {{ $t('Remaining time') }}: {{ selectedOrderRemaininTime }}s
              </div>
            </div>
          </span>
        </div>
      </div>
      <template #footer>
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton
              color="danger"
              flavor="solid"
              @click="cancelBinartOrder()"
              :disabled="isLoading"
              :loading="isLoading"
            >
              {{ $t('Cancel') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>

<style>
#tv_chart_container {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
}
</style>
