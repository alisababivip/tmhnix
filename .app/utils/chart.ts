export const useChart = () => {
  const supported_resolutions_provider: any = {
    ecosystem: [
      '1',
      '3',
      '5',
      '15',
      '30',
      '60',
      '120',
      '240',
      '360',
      '720',
      'D',
      'W',
    ],
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

  const resolutionMap_provider: any = {
    ecosystem: {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '720': '12h',
      D: '1d',
      W: '1w',
    },
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

  const intervalDurations: any = {
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
    '1W': 871872000000,
  }

  const disabled_features: any = [
    'header_compare',
    'symbol_search_hot_key',
    'header_symbol_search',
    'border_around_the_chart',
    'popup_hints',
    'timezone_menu',
  ]
  const enabled_features: any = [
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

  const lightColors = {
    success: '#14B8A6',
    failure: '#D73A57',
    pending: '#F59E0B',
    stop: '#FF5733',
    draw: '#BDBDBD',
  }

  const darkColors = {
    success: '#00A896',
    failure: '#C1292E',
    pending: '#DAA520',
    stop: '#D43F00',
    draw: '#808080',
  }

  function calculateRemainingSeconds(time: string): number {
    return Math.floor((new Date(time).getTime() - new Date().getTime()) / 1000)
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

  return {
    supported_resolutions_provider,
    resolutionMap_provider,
    intervalDurations,
    disabled_features,
    enabled_features,
    lightColors,
    darkColors,
    calculateRemainingSeconds,
    calculateRemainingTime,
    extractBinaryOrderData,
  }
}
