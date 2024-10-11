import { createLogger } from '../../../logger'
import { handleController } from '../../../utils'
import ExchangeManager from '../../../utils/exchange'
import { redis } from '../../../utils/redis'
import {
  getMarket,
  getMarkets,
  updateMarket,
  updateMarketsStatus,
} from './queries'

const logger = createLogger('Exchange Markets')

export async function cacheExchangeMarkets() {
  const markets = await getMarkets()
  await redis.set('exchangeMarkets', JSON.stringify(markets), 'EX', 10800) // Cache for 3 hours
}

cacheExchangeMarkets()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedMarkets = await redis.get('exchangeMarkets')
      if (cachedMarkets) return JSON.parse(cachedMarkets)
    } catch (err) {
      logger.error('Redis error:', err)
    }
    return await getMarkets()
  }),

  show: handleController(async (_, __, params) => {
    try {
      const cachedMarkets = await redis.get('exchangeMarkets')
      if (cachedMarkets) {
        const markets = JSON.parse(cachedMarkets)
        const market = markets.find((m) => m.id === Number(params.id))
        if (market) return market
      }
    } catch (err) {
      logger.error('Redis error:', err)
    }
    return await getMarket(Number(params.id))
  }),

  ticker: handleController(async (_, __, params) => {
    const { currency, pair } = params
    try {
      const exchange = await (ExchangeManager as any).startExchange()
      return await exchange.fetchTicker(`${currency}/${pair}`)
    } catch (error) {
      logger.error(`Failed to fetch ticker: ${error.message}`)
      throw new Error(`Failed to fetch ticker`)
    }
  }),

  orderbook: handleController(async (_, __, params, query) => {
    const { currency, pair } = params
    const limit = parseInt(query.limit, 10)
    try {
      const exchange = await (ExchangeManager as any).startExchange()
      const response = await exchange.fetchOrderBook(
        `${currency}/${pair}`,
        Number(limit),
      )

      return {
        asks: response.asks,
        bids: response.bids,
      }
    } catch (error) {
      logger.error(`Failed to fetch orderbook: ${error.message}`)
      throw new Error(`Failed to fetch orderbook`)
    }
  }),

  tickers: handleController(async () => {
    let marketsCache: any = []

    try {
      const cachedMarkets = await redis.get('exchangeMarkets')
      if (cachedMarkets) {
        marketsCache = JSON.parse(cachedMarkets)
      } else {
        await cacheExchangeMarkets()
        marketsCache = await getMarkets()
      }
    } catch (err) {
      logger.error('Redis error:', err)
    }

    try {
      const exchange = await (ExchangeManager as any).startExchange()

      // Prepare the list of market symbols from the cache
      const marketSymbols = marketsCache.map((market: any) => market.symbol)

      if (marketSymbols.length === 0) {
        return []
      }

      const tickers = await exchange.fetchTickers(marketSymbols)

      // Filter the tickers to include only the required fields
      const filteredTickers: any = {}
      for (const [symbol, ticker] of Object.entries(tickers)) {
        const tickerAsDefined = ticker as any
        filteredTickers[symbol] = {
          symbol: tickerAsDefined.symbol,
          bid: tickerAsDefined.bid,
          ask: tickerAsDefined.ask,
          close: tickerAsDefined.close,
          last: tickerAsDefined.last,
          change: tickerAsDefined.percentage,
          baseVolume: tickerAsDefined.baseVolume,
          quoteVolume: tickerAsDefined.quoteVolume,
        }
      }

      return filteredTickers
    } catch (error) {
      logger.error(`Failed to fetch tickers: ${error.message}`)
      throw new Error('Failed to fetch tickers')
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const response = await updateMarket(
      Number(params.id),
      body.metadata,
      body.is_trending,
      body.is_hot,
    )
    cacheExchangeMarkets() // Update the cache
    return response
  }),

  updateStatus: handleController(async (_, __, ___, ____, body) => {
    const response = await updateMarketsStatus(body.ids, body.status)
    cacheExchangeMarkets() // Update the cache
    return response
  }),
}
