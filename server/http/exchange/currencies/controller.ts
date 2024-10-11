import { handleController } from '../../../utils'
import ExchangeManager from '../../../utils/exchange'
import { redis } from '../../../utils/redis'
import { cacheExchangeMarkets } from '../markets/controller'
import { getMarkets } from '../markets/queries'
import {
  getCurrencies,
  getCurrency,
  updateCurrenciesStatus,
  updateCurrency,
  updateCurrencyChains,
  updateCurrencyPricesBulk,
} from './queries'

// Function to cache the currencies
export async function cacheExchangeCurrencies() {
  const currencies = await getCurrencies()
  await redis.set('exchangeCurrencies', JSON.stringify(currencies), 'EX', 1800) // Cache for 30 minutes
}

// Initialize the cache when the file is loaded
cacheExchangeCurrencies()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedCurrencies = await redis.get('exchangeCurrencies')
      if (cachedCurrencies) return JSON.parse(cachedCurrencies)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getCurrencies()
  }),

  show: handleController(async (_, __, params) => {
    try {
      const cachedCurrencies = await redis.get('exchangeCurrencies')
      if (cachedCurrencies) {
        const currencies = JSON.parse(cachedCurrencies)
        const currency = currencies.find((c) => c.id === Number(params.id))
        if (currency) return currency
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getCurrency(Number(params.id))
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const response = await updateCurrency(Number(params.id), body.data)
    cacheExchangeCurrencies()
    return response
  }),

  updateStatus: handleController(async (_, __, ___, ____, body) => {
    const response = await updateCurrenciesStatus(body.ids, body.status)
    cacheExchangeCurrencies()
    return response
  }),

  updateChains: handleController(async (_, __, params, ___, body) => {
    const response = await updateCurrencyChains(Number(params.id), body.chains)
    cacheExchangeCurrencies()
    return response
  }),

  cron: handleController(async () => {
    try {
      await processCurrenciesPrices()
    } catch (error) {
      throw new Error(error)
    }
  }),
}

export async function processCurrenciesPrices() {
  const exchange = await (ExchangeManager as any).startExchange()
  let markets: any = {}
  let marketsCache: any = []
  let currenciesCache: any = []

  // Fetch markets from Redis cache
  try {
    const cachedMarkets = await redis.get('exchangeMarkets')
    if (cachedMarkets) {
      marketsCache = JSON.parse(cachedMarkets)
    } else {
      await cacheExchangeMarkets()
      marketsCache = await getMarkets()
    }
  } catch (err) {
    console.error('Redis error:', err)
  }

  // Fetch currencies from Redis cache
  try {
    const cachedCurrencies = await redis.get('exchangeCurrencies')
    if (cachedCurrencies) {
      currenciesCache = JSON.parse(cachedCurrencies)
    } else {
      await cacheExchangeCurrencies()
      currenciesCache = await getCurrencies()
    }
  } catch (err) {
    console.error('Redis error:', err)
  }

  const marketSymbols = marketsCache.map((market: any) => market.symbol)
  try {
    markets = await exchange.fetchTickers(marketSymbols)
  } catch (error) {
    console.log('Update currencies pricing failed:', error.message)
    return
  }

  // Filter symbols with pair "USDT"
  const usdtPairs = Object.keys(markets).filter((symbol) =>
    symbol.endsWith('/USDT'),
  )

  if (!currenciesCache) {
    await cacheExchangeCurrencies()
  }

  // Prepare data for bulk update
  const bulkUpdateData = usdtPairs
    .map((symbol) => {
      const currency = symbol.split('/')[0]
      const matchingCurrency = currenciesCache.find(
        (dbCurrency) => dbCurrency.currency === currency,
      )

      if (matchingCurrency) {
        return {
          id: matchingCurrency.id,
          price: markets[symbol].last, // last price of the ticker
        }
      }
      return null
    })
    .filter((item) => item !== null)

  // Add USDT with price 1 if it's in the database currencies
  const usdtCurrency = currenciesCache.find(
    (dbCurrency) => dbCurrency.currency === 'USDT',
  )
  if (usdtCurrency) {
    bulkUpdateData.push({
      id: usdtCurrency.id,
      price: 1,
    })
  }

  // Bulk update currency price in database
  try {
    await updateCurrencyPricesBulk(bulkUpdateData)
  } catch (error) {
    console.log('Update currencies pricing failed:', error.message)
  }
  return true
}
