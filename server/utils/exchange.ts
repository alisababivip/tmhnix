import * as ccxt from 'ccxt'
import { createLogger } from '../logger'
import prisma from './prisma'
import { sleep } from './system'

const logger = createLogger('Exchange')

class ExchangeManager {
  static readonly instance = new ExchangeManager()
  private readonly exchangeCache = new Map<string, any>()
  private provider: string | null = null
  private exchange: any = null
  private exchangeProvider: any = null

  private async fetchActiveProvider(): Promise<string | null> {
    try {
      const provider = await prisma.exchange.findFirst({
        where: {
          status: true,
        },
      })
      if (!provider) {
        logger.error('No active provider found.')
        return null
      }
      return provider.name
    } catch (error) {
      logger.error('Error fetching active provider:', error)
      return null
    }
  }

  private async initializeExchange(
    provider: string,
    retries = 3,
  ): Promise<any> {
    if (this.exchangeCache.has(provider)) {
      return this.exchangeCache.get(provider)
    }

    const apiKey = process.env[`APP_${provider.toUpperCase()}_API_KEY`]
    const apiSecret = process.env[`APP_${provider.toUpperCase()}_API_SECRET`]
    const apiPassphrase =
      process.env[`APP_${provider.toUpperCase()}_API_PASSPHRASE`]

    if (!apiKey || !apiSecret || apiKey === '' || apiSecret === '') {
      logger.error(`API credentials for ${provider} are missing.`)
    }

    try {
      let exchange = new ccxt.pro[provider]({
        apiKey,
        secret: apiSecret,
        password: apiPassphrase,
      })

      const credentialsValid = await exchange.checkRequiredCredentials()
      if (!credentialsValid) {
        logger.error(`API credentials for ${provider} are invalid.`)
        await exchange.close()

        exchange = new ccxt[provider]()
      }

      try {
        await exchange.loadMarkets()
      } catch (error) {
        logger.error(`Failed to load markets: ${error.message}`)
        await exchange.close()

        exchange = new ccxt[provider]()
      }

      this.exchangeCache.set(provider, exchange)
      return exchange
    } catch (error) {
      logger.error(`Failed to initialize exchange: ${error}`)
      if (retries > 0) {
        logger.error(`Retrying (${retries} retries left)...`)
        await sleep(2000)
        return this.initializeExchange(provider, retries - 1)
      }
      return null
    }
  }

  public async startExchange(): Promise<any> {
    if (this.exchange) {
      return this.exchange
    }

    this.provider = this.provider || (await this.fetchActiveProvider())
    if (!this.provider) {
      return null
    }

    this.exchange =
      this.exchangeCache.get(this.provider) ||
      (await this.initializeExchange(this.provider))
    return this.exchange
  }

  public async startExchangeProvider(provider: string): Promise<any> {
    if (!provider) {
      throw new Error('Provider is required to start exchange provider.')
    }

    this.exchangeProvider =
      this.exchangeCache.get(provider) ||
      (await this.initializeExchange(provider))
    return this.exchangeProvider
  }

  public removeExchange(provider: string): void {
    if (!provider) {
      throw new Error('Provider is required to remove exchange.')
    }

    this.exchangeCache.delete(provider)
    if (this.provider === provider) {
      this.exchange = null
      this.provider = null
    }
  }
}

export default ExchangeManager.instance
