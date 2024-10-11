// http/exchange/settings/controller.ts
import { handleController } from '../../../utils'
import { activateLicense, verifyLicense } from '../../../utils/api'
import ExchangeManager from '../../../utils/exchange'
import { cacheExchangeCurrencies } from '../currencies/controller'
import { cacheExchangeMarkets } from '../markets/controller'
import { getExchangeDetails, saveExchangeMarkets, saveLicense } from './queries'

export const controllers = {
  checkConnection: handleController(async (_, __, ___, query) => {
    const exchange = await (ExchangeManager as any).startExchangeProvider(
      query.exchange,
    )
    try {
      const response = await exchange.checkRequiredCredentials()
      return {
        ...response,
        message: 'Connection successful',
      }
    } catch (error) {
      throw new Error(`Failed to connect to exchange: ${error}`)
    }
  }),

  fetchMarkets: handleController(async (_, __, ___, query) => {
    const exchangeId = query.exchange
    if (!exchangeId) {
      throw new Error('No exchange found')
    }
    const exchange = await (ExchangeManager as any).startExchangeProvider(
      exchangeId,
    )
    await exchange.loadMarkets()
    const markets = exchange.markets as unknown as any[]

    const groupedByQuote = {}

    for (const market of Object.values(markets)) {
      if (market.active && market.precision.price && market.precision.amount) {
        if (exchangeId === 'binance' && market.type !== 'spot') {
          continue
        }
        const { quote, symbol, base, precision, limits, taker, maker } = market
        if (!groupedByQuote[quote]) {
          groupedByQuote[quote] = {}
        }
        let precisions = {}

        switch (exchangeId) {
          case 'binance':
            precisions = {
              price: precision.price,
              amount: precision.amount,
            }
            break
          case 'kucoin':
            precisions = {
              price: countDecimals(precision.price),
              amount: countDecimals(precision.amount),
            }
            break
        }

        groupedByQuote[quote][symbol] = {
          symbol,
          base,
          quote,
          precision: precisions,
          limits,
          taker,
          maker,
        }
      }
    }

    return groupedByQuote
  }),

  saveMarkets: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await saveExchangeMarkets(body.symbols, body.currencies)
      await cacheExchangeMarkets()
      await cacheExchangeCurrencies()
      return {
        message: 'Exchange markets and currencies saved successfully!',
      }
    } catch (error) {
      throw new Error(`Failed to save exchange markets: ${error.message}`)
    }
  }),

  getDetails: handleController(async () => {
    return getExchangeDetails()
  }),

  verify: handleController(async (_, __, ___, ____, body) => {
    const response = await verifyLicense(
      body.productId,
      body.purchaseCode,
      body.envatoUsername,
    )

    // Check if the response has a message and if it starts with "Verified"
    if (response.message && response.message.startsWith('Verified')) {
      try {
        await saveLicense(body.productId, body.envatoUsername)
      } catch (error) {
        console.log('Error saving license:', error.message)
      }
    } else {
      console.log('License verification failed or not verified.')
    }
  }),

  activate: handleController(async (_, __, ___, ____, body) => {
    if (!body.envatoUsername || !body.productId || !body.purchaseCode) {
      throw new Error('Missing required fields')
    }
    try {
      const response = await activateLicense(
        body.productId,
        body.purchaseCode,
        body.envatoUsername,
      )

      if (response.lic_response) {
        try {
          await saveLicense(body.productId, body.envatoUsername)
        } catch (error) {
          console.log('Error saving license:', error.message)
        }
      }

      return {
        message: response.message,
      }
    } catch (error) {
      throw new Error(`Failed to activate license: ${error.message}`)
    }
  }),

  fetchCurrencies: handleController(async (_, __, ___, query) => {
    const exchangeId = query.exchange
    if (!exchangeId) {
      throw new Error('No exchange found')
    }
    const exchange = await (ExchangeManager as any).startExchangeProvider(
      exchangeId,
    )
    await exchange.loadMarkets()
    const currencies = exchange.currencies

    // Transforming the currencies to include only required fields
    const transformedCurrencies: Record<string, any> = {}
    Object.values(currencies).forEach((currency: any) => {
      let standardizedNetworks: any
      if (exchangeId === 'binance') {
        standardizedNetworks = standardizeBinanceData(currency.networks)
      } else if (exchangeId === 'kucoin') {
        standardizedNetworks = standardizeKucoinData(currency)
      }

      transformedCurrencies[currency['code']] = {
        currency: currency['code'],
        name: currency['name'],
        precision: currency['precision'],
        status: currency['active'],
        deposit: currency['deposit'],
        withdraw: currency['withdraw'],
        fee: currency['fee'],
        chains: standardizedNetworks,
      }
    })

    return transformedCurrencies
  }),
}

// Function to standardize data from Binance
const standardizeBinanceData = (data: any) => {
  return data.map((item: any) => ({
    network: item.network,
    withdrawStatus: item.withdrawEnable,
    depositStatus: item.depositEnable,
    minWithdraw: parseFloat(item.withdrawMin),
    maxWithdraw: parseFloat(item.withdrawMax),
    withdrawFee: parseFloat(item.withdrawFee),
    withdrawMemo: item.memoRegex && item.memoRegex.trim() !== '' ? true : false,
  }))
}

// Function to standardize data from Kucoin
const standardizeKucoinData = (data: any) => {
  const standardizedData = data.info?.chains || [] // Fetching chains from info
  return standardizedData.map((chain: any) => ({
    network: chain.chainName,
    withdrawStatus: chain.isWithdrawEnabled,
    depositStatus: chain.isDepositEnabled,
    minWithdraw: parseFloat(chain.withdrawalMinSize),
    maxWithdraw: null, // Not provided by KuCoin
    withdrawFee: parseFloat(chain.withdrawalMinFee),
    withdrawMemo:
      chain.contractAddress && chain.contractAddress.trim() !== ''
        ? true
        : false,
    chainId: chain.chainId.toUpperCase(),
  }))
}

function countDecimals(num: number): number {
  if (Math.floor(num) === num) return 0
  const str = num.toString()
  const scientificNotationMatch = /^(\d+\.?\d*|\.\d+)e([\+\-]\d+)$/.exec(str)

  if (scientificNotationMatch) {
    const decimalStr = scientificNotationMatch[1].split('.')[1] || ''
    let decimalCount = decimalStr.length + parseInt(scientificNotationMatch[2])
    decimalCount = Math.abs(decimalCount) // Take the absolute value
    return Math.min(decimalCount, 8)
  } else {
    const decimalStr = str.split('.')[1] || ''
    return Math.min(decimalStr.length, 8)
  }
}
