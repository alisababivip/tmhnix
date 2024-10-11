<script setup lang="ts">
import { widget as TradingView } from '~~/plugins/charting_library'
import { useSocketStore } from '~~/store/socket'
const props = defineProps({
  currency: String,
  pair: String,
  isBinary: Boolean,
})

const { getHistorical } = useExchange()
const { toast } = useUtils()
const config = useRuntimeConfig()
const provider = config.public.appActiveExchange ?? 'kucoin'
const socketStore = useSocketStore()
const marketStore = useMarketStore()
const settingsStore = useSettingsStore()
const walletStore = useWalletStore()
const userStore = useUserStore()
const chartReady = ref(false)
const darkModeStore = useDarkModeStore()
const cutPercentage = ref(0)
const isCancelOpen = ref(false)
const isLoading = ref(false)
const selectedOrder = ref(null)
const settings = computed(() => settingsStore.settings)
const route = useRoute()
const { isPractice } = route.query
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
const isDarkMode = computed(() => darkModeStore.isDarkMode)

// Define colors for light mode
const lightColors = {
  success: '#14B8A6',
  failure: '#D73A57',
  pending: '#F59E0B',
  stop: '#FF5733',
  draw: '#BDBDBD',
}

// Define colors for dark mode (customize these as needed)
const darkColors = {
  success: '#00A896',
  failure: '#C1292E',
  pending: '#DAA520',
  stop: '#D43F00',
  draw: '#808080',
}

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

onMounted(async () => {
  updateProviderSettings(provider)
  initTradingView()

  if (userStore.isLoggedIn) {
    if (
      (props.isBinary && marketStore.binaryPositions.length === 0) ||
      (marketStore.binaryPositions.length > 0 &&
        marketStore.binaryPositions[0].is_demo !== isPractice)
    ) {
      await marketStore.fetchBinaryPositions(isPractice ? 'DEMO' : 'LIVE')
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

watch(
  () => marketStore.binaryExpirationTimes[0],
  (newTime) => handleBinaryExpirationTime(newTime),
)

function handleBinaryExpirationTime(newTime: string) {
  const remainingSeconds = calculateRemainingSeconds(newTime)
  if (remainingSeconds <= 0) {
    processPositionLines()
  } else {
    updatePositionLines()
  }
}

function calculateRemainingSeconds(time: string): number {
  return Math.floor((new Date(time).getTime() - new Date().getTime()) / 1000)
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
  const processingInterval = setInterval(async () => {
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
  await marketStore.fetchBinaryPositions(isPractice ? 'DEMO' : 'LIVE')
  const updatedOrder = marketStore.binaryPositions.find(
    (o) => o.uuid === order.uuid,
  )

  if (updatedOrder && updatedOrder.status !== 'PENDING') {
    clearInterval(processingInterval)
    notifyProfit(updatedOrder)
    try {
      positionLines.value.get(key)?.line.remove()
      positionLines.value.delete(key)
    } catch (error) {
      console.log(error)
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
  let profit, message

  if (!walletStore.wallet) {
    console.error('Wallet is not available.')
    return
  }

  switch (order.status) {
    case 'WIN':
      profit = order.amount * (Number(order.profit) / 100)
      message = `Congratulations! You won ${profit} ${props.pair}.`
      walletStore.wallet.balance += profit + order.amount
      toast.successText(message)
      break
    case 'LOSS':
      profit = -order.amount
      message = `Sorry! You lost ${profit} ${props.pair}.`
      walletStore.wallet.balance += profit // Adjust this line as per your logic
      toast.dangerText(message)
      break
    case 'DRAW':
      message = `Your order was a draw. You didn't win or lose anything.`
      walletStore.wallet.balance += order.amount // Adjust this line as per your logic
      toast.muted(message)
      break
  }

  selectedOrder.value = null
  isCancelOpen.value = false
  isLoading.value = false
}

function calculateRemainingTime(order: any): number {
  const currentTime = new Date().getTime()
  const closeAtTime = new Date(order.closed_at).getTime()
  const remainingMilliseconds = closeAtTime - currentTime

  // Convert milliseconds to seconds
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000)

  // Ensure the remaining time is not negative
  return Math.max(remainingSeconds, 0)
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

function extractBinaryOrderData(order: any, newBestAsk: number) {
  const createdTime = new Date(order.created_at).getTime()
  const closedTime = new Date(order.closed_at).getTime()
  const currentTime = new Date().getTime()
  const totalTime = (closedTime - createdTime) / 1000
  const remainingTime = (closedTime - currentTime) / 1000
  const isRiseOrder = order.side === 'RISE'
  const priceChange = ((newBestAsk - order.price) / order.price) * 100
  return { totalTime, remainingTime, isRiseOrder, priceChange }
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
            const response = await marketStore.cancelOrder(order.uuid)
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

async function cancelOrder() {
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
      walletStore.wallet.balance += refundAmount
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

let worker = createWorker()
let widget: any = null
let resolutionMap: any = null
let supported_resolutions: any = null

const supported_resolutions_provider = {
  binance: [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '480',
    '720',
    'D',
  ],
  binanceus: [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '480',
    '720',
    'D',
  ],
  kucoin: ['1', '5', '15', '30', '60', '240', 'D'],
  bitget: ['1', '5', '15', '30', '60', '240', '360', '720', 'D'],
}

supported_resolutions = supported_resolutions_provider[provider]

let resolutionMap_provider = {
  binance: {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    D: '1d',
  },
  binanceus: {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    D: '1d',
  },
  kucoin: {
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '240': '4h',
    '1D': '1d',
  },
  bitget: {
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '240': '4h',
    '360': '6h',
    '720': '12h',
    '1D': '1d',
  },
}

resolutionMap = resolutionMap_provider[provider]

const intervalDurations = {
  '1': 86400000,
  '3': 259200000,
  '5': 432000000,
  '15': 1296000000,
  '30': 2592000000,
  '60': 5184000000,
  '120': 10368000000,
  '240': 20736000000,
  '360': 31104000000,
  '480': 41472000000,
  '720': 62208000000,
  '1D': 124416000000,
}

const state = ref({
  interval: null,
  ws: null,
  since: null,
  duration: 86400000, // milliseconds
  now: Date.now(),
  lastprice: [],
  subscribers: {},
})

const disabled_features = [
  'header_compare',
  'symbol_search_hot_key',
  'header_symbol_search',
  'border_around_the_chart',
  'popup_hints',
  'timezone_menu',
]
const enabled_features = [
  'save_chart_properties_to_local_storage',
  'use_localstorage_for_settings',
  'dont_show_boolean_study_arguments',
  'hide_last_na_study_output',
  'constraint_dialogs_movement',
  'countdown',
  'insert_indicator_dialog_shortcut',
  'shift_visible_range_on_new_bar',
  'hide_image_invalid_symbol',
  'pre_post_market_sessions',
  'use_na_string_for_not_available_values',
  'create_volume_indicator_by_default',
  'determine_first_data_request_size_using_visible_range',
  'end_of_period_timescale_marks',
  'secondary_series_extend_time_scale',
  'shift_visible_range_on_new_bar',
]

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

    const creatable = document.querySelector('#creatable')
    creatable.appendChild(newChartContainer)
  }
  var symbol = props.currency + '/' + props.pair
  const tvWidget = new TradingView({
    // debug: true,
    fullscreen: false,
    autosize: true,
    symbol: symbol,
    interval: '60' as any,
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

let datafeed = {
  onReady: function (cb) {
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
    const duration = intervalDurations[resolution] || 0
    const from = periodParams.from * 1000
    const to = periodParams.to * 1000

    try {
      // Fetch historical data from your API
      const response = await getHistorical(
        symbolInfo.ticker,
        resolutionMap[resolution],
        from,
        to,
        duration,
      )

      // Parse the data from the response
      const data = await response.data.result

      // Check if data was returned
      if (data && data.length) {
        // Convert data to the format required by TradingView
        const bars = data.map((item: any) => ({
          time: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
          volume: item[5],
        }))

        // Sort the bars by time
        bars.sort((a, b) => a.time - b.time)

        if (props.isBinary) {
          marketStore.bestAsk = bars[bars.length - 1].close
          setProfit(bars[bars.length - 1].close)
        }

        onHistoryCallback(bars)
      } else {
        onHistoryCallback([], { noData: true })
      }
    } catch (error) {
      onErrorCallback(new Error('Failed to fetch historical data'))
      return
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
      socketStore.subscribe('trade', {
        symbol: `${props.currency}/${props.pair}`,
        type: 'watchOHLCV',
        interval: state.value.interval,
      })
    }
  },

  unsubscribeBars: function (subscriberUID: any) {
    if (!state.value.subscribers[subscriberUID]) return
    // Remove the subscriber from the global map
    delete state.value.subscribers[subscriberUID]

    // Unsubscribe from the current interval
    if (state.value.interval) {
      socketStore.unsubscribe('trade', {
        symbol: `${props.currency}/${props.pair}`,
        type: 'watchOHLCV',
        interval: state.value.interval,
      })
    }

    // Reset the interval
    state.value.interval = null
  },
}

function createWorker() {
  return new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
self.onmessage = function (event) {
  const rawData = event.data;

  if (!rawData) {
    return;
  }
  const data = JSON.parse(rawData);

  if (data.watchOHLCV === undefined || data.watchOHLCV === null) {
    return;
  }
  const watchOHLCV = data.watchOHLCV;

  const processedData = {
    time: watchOHLCV[0][0],
    open: watchOHLCV[0][1],
    high: watchOHLCV[0][2],
    low: watchOHLCV[0][3],
    close: watchOHLCV[0][4],
    volume: watchOHLCV[0][5],
  };

  // Post the processed data back to the main thread.
  self.postMessage(processedData);
};
        `,
        ],
        { type: 'text/javascript' },
      ),
    ),
  )
}

// Listen for messages from the worker...
worker.onmessage = (event) => {
  // The data returned from the worker...
  let data = event.data

  if (props.isBinary) {
    marketStore.bestAsk = data.close
    setProfit(data.close)
  }
  // Iterate through all subscribers and send updates
  Object.values(state.value.subscribers).forEach((subscriberInfo: any) => {
    if (subscriberInfo.callback) {
      subscriberInfo.callback(data)
    }
  })
}

watch(
  () => socketStore.tradeData,
  (newData) => {
    worker.postMessage(newData)
  },
  { immediate: true },
)
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
              @click="cancelOrder()"
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
