import ExchangeManager from '~~/utils/exchange'

export async function getHistoricalOHLCV(
  symbol: any,
  interval: any,
  from: number,
  to: number,
  duration: number,
) {
  let since, max
  const exchange = await (ExchangeManager as any).startExchange()
  const provider = await (ExchangeManager as any).provider

  switch (provider) {
    case 'binance':
      since = to - duration / 3
      max = 500
      break
    case 'kucoin':
      since = to - duration
      max = 1500
      break
    case 'bitget':
      since = to - duration / 1.5
      max = 1000
      break
    default:
      since = to - duration
      max = 1000
      break
  }

  try {
    const data = await exchange.fetchOHLCV(symbol, interval, since, max)

    return data
  } catch (e) {
    if (e.constructor.name === '419') {
      const data = await exchange.fetchOHLCV(symbol, interval, since)
      return data
    }
    throw new Error(e as any)
  }
}
