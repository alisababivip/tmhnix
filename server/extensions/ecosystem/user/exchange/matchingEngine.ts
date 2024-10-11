import {
  fromBigInt,
  removeTolerance,
  toBigIntFloat,
} from '../../utils/blockchain'
import { getLatestOrdersForCandles, intervals } from '../../utils/candles'
import { matchAndCalculateOrders, validateOrder } from '../../utils/matchmaking'
import {
  applyUpdatesToOrderBook,
  fetchExistingAmounts,
  generateOrderBookUpdateQueries,
  updateSingleOrderBook,
} from '../../utils/orderbook'
import client from '../../utils/scylla/client'
import {
  fetchOrderBooks,
  generateOrderUpdateQueries,
  getAllOpenOrders,
  getLastCandles,
  type Candle,
  type Order,
} from '../../utils/scylla/queries'
import { normalizeTimeToInterval } from '../../utils/websocket'
import DataManager from '../../websocket/DataManager'
import { getMarkets } from '../markets/queries'

export class MatchingEngine {
  private dataManager: DataManager
  private static instancePromise: Promise<MatchingEngine> | null = null
  private orderQueue: Record<string, Order[]> = {}
  private marketsBySymbol: Record<string, any> = {}
  private lockedOrders: Set<string> = new Set()
  private lastCandle: Record<string, Record<string, Candle>> = {}

  private async processQueue() {
    const ordersToUpdate: Order[] = []
    const orderBookUpdates: Record<string, any> = {}

    // Fetch all order book entries from the database
    const allOrderBookEntries = await fetchOrderBooks()

    // Map the order book entries by symbol and then by side ('bids' or 'asks')
    const mappedOrderBook: Record<
      string,
      Record<'bids' | 'asks', Record<string, bigint>>
    > = {}

    allOrderBookEntries?.forEach((entry) => {
      if (!mappedOrderBook[entry.symbol]) {
        mappedOrderBook[entry.symbol] = { bids: {}, asks: {} }
      }
      mappedOrderBook[entry.symbol][entry.side.toLowerCase()][
        removeTolerance(toBigIntFloat(Number(entry.price))).toString()
      ] = removeTolerance(toBigIntFloat(Number(entry.amount)))
    })

    // Phase 1: Calculations
    const calculationPromises = []
    for (const symbol in this.orderQueue) {
      const orders = this.orderQueue[symbol]
      if (orders.length === 0) continue

      const promise = (async () => {
        const { matchedOrders, bookUpdates } = await matchAndCalculateOrders(
          orders,
          mappedOrderBook[symbol] || { bids: {}, asks: {} },
        )

        // Early return if no orders are matched for the current symbol
        if (matchedOrders.length === 0) {
          return
        }

        ordersToUpdate.push(...matchedOrders)
        orderBookUpdates[symbol] = bookUpdates
      })()

      calculationPromises.push(promise)
    }

    await Promise.all(calculationPromises)

    if (ordersToUpdate.length === 0) {
      return
    }

    // Phase 2: Update database
    await this.performUpdates(ordersToUpdate, orderBookUpdates)

    // Accumulate the final state of the order book
    const finalOrderBooks: Record<string, any> = {} // Initialize as needed
    for (const symbol in orderBookUpdates) {
      // Assume `applyUpdatesToOrderBook` is a function that applies updates to the current state
      finalOrderBooks[symbol] = applyUpdatesToOrderBook(
        mappedOrderBook[symbol],
        orderBookUpdates[symbol],
      )
    }

    // Phase 3: Cleanup
    const cleanupPromises = []
    for (const symbol in this.orderQueue) {
      const promise = (async () => {
        this.orderQueue[symbol] = this.orderQueue[symbol].filter(
          (order) => order.status === 'OPEN',
        )
      })()

      cleanupPromises.push(promise)
    }

    await Promise.all(cleanupPromises)

    // Phase 4: Broadcast
    this.broadcastUpdates(ordersToUpdate, finalOrderBooks)
  }

  private async performUpdates(
    ordersToUpdate: Order[],
    orderBookUpdates: Record<string, any>,
  ) {
    // Step 1: Lock the orders
    const locked = this.lockOrders(ordersToUpdate)
    if (!locked) {
      console.warn("Couldn't obtain a lock on all orders, skipping this batch.")
      return
    }

    // Step 2: Perform the updates
    const updateQueries: Array<{ query: string; params: any[] }> = []

    // Generate queries for updating orders
    updateQueries.push(...generateOrderUpdateQueries(ordersToUpdate))

    // Generate queries for updating candles
    const latestOrdersForCandles = getLatestOrdersForCandles(ordersToUpdate)

    latestOrdersForCandles.forEach((order) => {
      updateQueries.push(...this.updateLastCandles(order))
    })

    // Generate queries for updating the order book
    const orderBookQueries = generateOrderBookUpdateQueries(orderBookUpdates)
    updateQueries.push(...orderBookQueries)

    // Execute batch update
    if (updateQueries.length > 0) {
      try {
        await client.batch(updateQueries, { prepare: true })
      } catch (error) {
        console.error('Failed to batch update:', error)
      }
    } else {
      console.warn('No queries to batch update.')
    }

    // Step 3: Unlock the orders
    this.unlockOrders(ordersToUpdate)
  }

  public async addToQueue(order: Order) {
    if (!validateOrder(order)) {
      console.log('Invalid order. Not adding to queue.', order)
      return
    }
    if (
      isNaN(order.created_at.getTime()) ||
      isNaN(order.updated_at.getTime())
    ) {
      console.error('Invalid date in order:', order)
      return
    }

    // Initialize the queue for the symbol if it doesn't exist
    if (!this.orderQueue[order.symbol]) {
      this.orderQueue[order.symbol] = []
    }

    // Push the order into the queue
    this.orderQueue[order.symbol].push(order)

    // Update the order book immediately
    const symbolOrderBook = await updateSingleOrderBook(order, 'add')
    this.dataManager.handleOrderBookUpdate(order.symbol, symbolOrderBook)
    await this.processQueue()
  }

  private updateLastCandles(
    order: Order,
  ): Array<{ query: string; params: any[] }> {
    let finalPrice = BigInt(0)
    if (
      order.trades &&
      order.trades.length > 0 &&
      (order.trades[order.trades.length - 1] as any).price !== undefined
    ) {
      finalPrice = toBigIntFloat(
        (order.trades[order.trades.length - 1] as any).price,
      )
    } else if (order.price !== undefined) {
      finalPrice = order.price
    } else {
      console.error('Neither trade prices nor order price are available')
      return []
    }

    const updateQueries: Array<{ query: string; params: any[] }> = []

    if (!this.lastCandle[order.symbol]) {
      this.lastCandle[order.symbol] = {}
    }

    intervals.forEach((interval) => {
      const updateQuery = this.generateCandleQueries(
        order,
        interval,
        finalPrice,
      )
      if (updateQuery) {
        updateQueries.push(updateQuery)
      }
    })

    return updateQueries
  }
  private generateCandleQueries(
    order: Order,
    interval: string,
    finalPrice: bigint,
  ): { query: string; params: any[] } | null {
    const existingLastCandle = this.lastCandle[order.symbol]?.[interval]
    const normalizedCurrentTime = normalizeTimeToInterval(
      new Date().getTime(),
      interval,
    )
    const normalizedLastCandleTime = existingLastCandle
      ? normalizeTimeToInterval(
          new Date(existingLastCandle.created_at).getTime(),
          interval,
        )
      : null

    const shouldCreateNewCandle =
      !existingLastCandle || normalizedCurrentTime !== normalizedLastCandleTime

    if (shouldCreateNewCandle) {
      const newOpenPrice = existingLastCandle
        ? existingLastCandle.close
        : fromBigInt(finalPrice)

      if (!newOpenPrice) {
        console.log('newOpenPrice is null')
        return null
      }

      const finalPriceNumber = fromBigInt(finalPrice)

      const normalizedTime = new Date(
        normalizeTimeToInterval(new Date().getTime(), interval),
      )

      const newLastCandle = {
        symbol: order.symbol,
        interval,
        open: newOpenPrice,
        high: Math.max(newOpenPrice, finalPriceNumber),
        low: Math.min(newOpenPrice, finalPriceNumber),
        close: finalPriceNumber,
        volume: fromBigInt(order.amount),
        created_at: normalizedTime,
        updated_at: new Date(),
      }

      this.lastCandle[order.symbol][interval] = newLastCandle

      // Insert new candle into DB
      return {
        query:
          'INSERT INTO candles (symbol, interval, created_at, updated_at, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        params: [
          order.symbol,
          interval,
          newLastCandle.created_at,
          newLastCandle.updated_at,
          newOpenPrice,
          newLastCandle.high,
          newLastCandle.low,
          newLastCandle.close,
          newLastCandle.volume,
        ],
      }
    } else {
      let updateQuery = 'UPDATE candles SET updated_at = ?, close = ?'
      const now = new Date()
      const finalPriceNumber = fromBigInt(finalPrice)
      const updateParams: any[] = [now, finalPriceNumber]

      const newVolume = existingLastCandle.volume + fromBigInt(order.amount)
      updateQuery += ', volume = ?'
      updateParams.push(newVolume)

      if (finalPriceNumber > existingLastCandle.high) {
        updateQuery += ', high = ?'
        updateParams.push(finalPriceNumber)
        existingLastCandle.high = finalPriceNumber
      } else if (finalPriceNumber < existingLastCandle.low) {
        updateQuery += ', low = ?'
        updateParams.push(finalPriceNumber)
        existingLastCandle.low = finalPriceNumber
      }

      existingLastCandle.close = finalPriceNumber // Add this line to update close price
      existingLastCandle.volume = newVolume // Add this line to update volume
      existingLastCandle.updated_at = now // Add this line to update timestamp

      // Update the lastCandle cache
      this.lastCandle[order.symbol][interval] = existingLastCandle

      updateQuery += ' WHERE symbol = ? AND interval = ? AND created_at = ?'
      updateParams.push(order.symbol, interval, existingLastCandle.created_at)

      return {
        query: updateQuery,
        params: updateParams,
      }
    }
  }

  // extra

  async broadcastUpdates(
    ordersToUpdate: Order[],
    finalOrderBooks: Record<string, any>,
  ) {
    const updatePromises = []

    // Create promise for Order Updates
    updatePromises.push(...this.createOrdersBroadcastPromise(ordersToUpdate))

    // Create promises for Order Book and Candle Broadcasts
    for (const symbol in this.orderQueue) {
      updatePromises.push(
        this.createOrderBookUpdatePromise(symbol, finalOrderBooks[symbol]),
      )
      updatePromises.push(...this.createCandleBroadcastPromises(symbol))
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises)
  }

  private createOrderBookUpdatePromise(
    symbol: string,
    finalOrderBookState: any,
  ) {
    return this.dataManager.handleOrderBookUpdate(symbol, finalOrderBookState)
  }

  private createCandleBroadcastPromises(symbol: string) {
    const promises = []
    for (const interval in this.lastCandle[symbol]) {
      promises.push(
        this.dataManager.handleCandleBroadcast(
          symbol,
          interval,
          this.lastCandle[symbol][interval],
        ),
      )
    }
    promises.push(
      this.dataManager.handleTickerBroadcast(
        symbol,
        this.lastCandle[symbol]['1d'],
      ),
      this.dataManager.handleTickersBroadcast(this.getAllSymbols1DayCandles()),
    )
    return promises
  }

  private getAllSymbols1DayCandles(): { [symbol: string]: Candle } {
    const symbolsWithCandles: { [symbol: string]: Candle } = {}

    for (const symbol in this.lastCandle) {
      const lastCandle1d = this.lastCandle[symbol]['1d']
      if (lastCandle1d) {
        symbolsWithCandles[symbol] = lastCandle1d
      }
    }

    return symbolsWithCandles
  }

  private createOrdersBroadcastPromise(orders: Order[]) {
    return orders.map((order) => this.dataManager.handleOrderBroadcast(order))
  }

  private lockOrders(orders: Order[]): boolean {
    for (const order of orders) {
      if (this.lockedOrders.has(order.uuid)) {
        return false
      }
    }

    for (const order of orders) {
      this.lockedOrders.add(order.uuid)
    }

    return true
  }

  private unlockOrders(orders: Order[]) {
    for (const order of orders) {
      this.lockedOrders.delete(order.uuid)
    }
  }

  public static getInstance(): Promise<MatchingEngine> {
    if (!this.instancePromise) {
      this.instancePromise = (async () => {
        const instance = new MatchingEngine()
        await instance.init()
        return instance
      })()
    }
    return this.instancePromise
  }

  public async init() {
    this.dataManager = DataManager.getInstance()
    await this.initializeMarkets()
    await this.initializeOrders()
    await this.initializeLastCandles()
  }

  private async initializeMarkets() {
    const markets: any[] = await getMarkets()
    markets.forEach((market) => {
      this.marketsBySymbol[market.symbol] = market
      this.orderQueue[market.symbol] = []
    })
  }

  private async initializeOrders() {
    try {
      const openOrders = await getAllOpenOrders()
      openOrders.forEach((order) => {
        const normalizedOrder = {
          ...order,
          amount: BigInt(order.amount ?? 0),
          price: BigInt(order.price ?? 0),
          cost: BigInt(order.cost ?? 0),
          fee: BigInt(order.fee ?? 0),
          remaining: BigInt(order.remaining ?? 0),
          filled: BigInt(order.filled ?? 0),
        }

        if (!this.orderQueue[normalizedOrder.symbol]) {
          this.orderQueue[normalizedOrder.symbol] = []
        }
        this.orderQueue[normalizedOrder.symbol].push(normalizedOrder)
      })

      await this.processQueue()
    } catch (error) {
      console.error(`Failed to populate order queue with open orders: ${error}`)
    }
  }

  private async initializeLastCandles() {
    try {
      const lastCandles = await getLastCandles()

      lastCandles.forEach((candle) => {
        if (!this.lastCandle[candle.symbol]) {
          this.lastCandle[candle.symbol] = {}
        }
        this.lastCandle[candle.symbol][candle.interval] = candle
      })
    } catch (error) {
      console.error(`Failed to initialize last candles: ${error}`)
    }
  }

  public async handleOrderCancellation(orderId: string, symbol: string) {
    // Remove the order from the internal queue
    this.orderQueue[symbol] = this.orderQueue[symbol].filter(
      (order) => order.uuid !== orderId,
    )

    // Broadcast the updated order book. Assuming fetchExistingAmounts fetches the latest state.
    const updatedOrderBook = await fetchExistingAmounts(symbol)
    this.broadcastOrderBookUpdate(symbol, updatedOrderBook)

    // Optionally, process the remaining queue if necessary
    await this.processQueue()
  }

  private broadcastOrderBookUpdate(symbol: string, orderBook: any) {
    // Broadcasting logic
    this.dataManager.handleOrderBookUpdate(symbol, orderBook)
  }
}
