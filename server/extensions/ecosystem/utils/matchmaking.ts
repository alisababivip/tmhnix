import type { EcosystemOrderSide, TradeDetail } from '~~/types'
import { updateWalletBalance } from '../user/exchange/controller'
import { getWalletOnly } from '../user/wallets/queries'
import {
  BigIntReplacer,
  fromBigInt,
  fromBigIntMultiply,
  removeTolerance,
} from './blockchain'
import type { Order, OrderBook } from './scylla/queries'

const SCALING_FACTOR = BigInt(10 ** 18)

export const matchAndCalculateOrders = async (
  orders: Order[],
  currentOrderBook: OrderBook,
) => {
  const matchedOrders: Order[] = []
  const bookUpdates: OrderBook = { bids: {}, asks: {} }
  const processedOrders: Set<string> = new Set()

  const buyOrders = filterAndSortOrders(orders, 'BUY', true)
  const sellOrders = filterAndSortOrders(orders, 'SELL', false)

  let buyIndex = 0,
    sellIndex = 0

  while (buyIndex < buyOrders.length && sellIndex < sellOrders.length) {
    const buyOrder = buyOrders[buyIndex]
    const sellOrder = sellOrders[sellIndex]

    if (
      processedOrders.has(buyOrder.uuid) ||
      processedOrders.has(sellOrder.uuid)
    ) {
      if (processedOrders.has(buyOrder.uuid)) buyIndex++
      if (processedOrders.has(sellOrder.uuid)) sellIndex++
      continue
    }

    let matchFound = false

    if (buyOrder.type === 'LIMIT' && sellOrder.type === 'LIMIT') {
      matchFound =
        (buyOrder.side === 'BUY' && buyOrder.price >= sellOrder.price) ||
        (buyOrder.side === 'SELL' && sellOrder.price >= buyOrder.price)
    } else if (buyOrder.type === 'MARKET' || sellOrder.type === 'MARKET') {
      matchFound = true
    }

    if (matchFound) {
      processedOrders.add(buyOrder.uuid)
      processedOrders.add(sellOrder.uuid)

      await processMatchedOrders(
        buyOrder,
        sellOrder,
        currentOrderBook,
        bookUpdates,
      )

      matchedOrders.push(buyOrder, sellOrder)

      // For Limit orders, increment the index if they are fully filled.
      if (buyOrder.type === 'LIMIT' && buyOrder.remaining === 0n) {
        buyIndex++
      }
      if (sellOrder.type === 'LIMIT' && sellOrder.remaining === 0n) {
        sellIndex++
      }

      // For market orders, remove from processed list if they are not fully matched
      if (buyOrder.type === 'MARKET' && buyOrder.remaining > 0n) {
        processedOrders.delete(buyOrder.uuid)
      }
      if (sellOrder.type === 'MARKET' && sellOrder.remaining > 0n) {
        processedOrders.delete(sellOrder.uuid)
      }
    } else {
      if (
        buyOrder.type !== 'MARKET' &&
        BigInt(buyOrder.price) < BigInt(sellOrder.price)
      ) {
        buyIndex++
      }
      if (
        sellOrder.type !== 'MARKET' &&
        BigInt(sellOrder.price) > BigInt(buyOrder.price)
      ) {
        sellIndex++
      }
    }
  }

  return { matchedOrders, bookUpdates }
}

export const processMatchedOrders = async (
  buyOrder: Order,
  sellOrder: Order,
  currentOrderBook: OrderBook,
  bookUpdates: OrderBook,
): Promise<TradeDetail> => {
  const amountToFill =
    BigInt(buyOrder.remaining) < BigInt(sellOrder.remaining)
      ? BigInt(buyOrder.remaining)
      : BigInt(sellOrder.remaining)

  updateOrderBook(bookUpdates, buyOrder, currentOrderBook, amountToFill)
  updateOrderBook(bookUpdates, sellOrder, currentOrderBook, amountToFill)

  // Update order statuses
  ;[buyOrder, sellOrder].forEach((order) => {
    order.filled += amountToFill
    order.remaining -= amountToFill
    order.status = order.remaining === 0n ? 'CLOSED' : 'OPEN'
  })

  // Wallet updates
  const [currency, pair] = buyOrder.symbol.split('/')
  const buyerWallet = await getWalletOnly(buyOrder.user_id, currency)
  const sellerWallet = await getWalletOnly(sellOrder.user_id, pair)

  if (buyerWallet && sellerWallet) {
    // Perform the calculations directly using BigInt
    const cost = (amountToFill * BigInt(buyOrder.price)) / SCALING_FACTOR
    const fee = (cost * BigInt(sellOrder.fee)) / (100n * SCALING_FACTOR)

    // Update the buyer and seller wallets
    await updateWalletBalance(
      buyerWallet,
      fromBigInt(removeTolerance(amountToFill)),
      'add',
    )
    await updateWalletBalance(
      sellerWallet,
      fromBigInt(removeTolerance(cost - fee)),
      'add',
    )
  }
  // Create trade detail
  const finalPrice =
    buyOrder.type === 'MARKET'
      ? sellOrder.price
      : sellOrder.type === 'MARKET'
      ? buyOrder.price
      : buyOrder.price

  const tradeDetail: TradeDetail = {
    uuid: `${buyOrder.uuid}`,
    amount: fromBigInt(amountToFill),
    price: fromBigInt(finalPrice),
    cost: fromBigIntMultiply(amountToFill, finalPrice),
    side: buyOrder.side as EcosystemOrderSide,
    timestamp: Date.now(),
  }

  addTradeToOrder(buyOrder, tradeDetail)
  addTradeToOrder(sellOrder, tradeDetail)

  return tradeDetail
}

const updateOrderBook = (
  bookUpdates: OrderBook,
  order: Order,
  currentOrderBook: OrderBook,
  amount: bigint,
) => {
  const priceStr = order.price.toString()
  const bookSide = order.side === 'BUY' ? 'bids' : 'asks'

  // Update the current order book first
  if (currentOrderBook[bookSide][priceStr]) {
    currentOrderBook[bookSide][priceStr] -= amount
  }

  // Then update bookUpdates based on currentOrderBook
  bookUpdates[bookSide][priceStr] = currentOrderBook[bookSide][priceStr]
}

export const filterAndSortOrders = (
  orders: Order[],
  side: 'BUY' | 'SELL',
  isBuy: boolean,
): Order[] => {
  return orders
    .filter((o) => o.side === side)
    .sort((a, b) => {
      if (isBuy) {
        return (
          Number(b.price) - Number(a.price) ||
          a.created_at.getTime() - b.created_at.getTime()
        )
      } else {
        return (
          Number(a.price) - Number(b.price) ||
          a.created_at.getTime() - b.created_at.getTime()
        )
      }
    })
    .filter((order) => !isBuy || BigInt(order.price) >= 0n)
}

export function validateOrder(order: Order): boolean {
  if (
    !order ||
    !order.uuid ||
    !order.user_id ||
    !order.symbol ||
    !order.type ||
    !order.side ||
    typeof order.price !== 'bigint' ||
    typeof order.amount !== 'bigint' ||
    typeof order.filled !== 'bigint' ||
    typeof order.remaining !== 'bigint' ||
    typeof order.cost !== 'bigint' ||
    typeof order.fee !== 'bigint' ||
    !order.fee_currency ||
    !order.status ||
    !(order.created_at instanceof Date) || // Validate if it's a Date object
    !(order.updated_at instanceof Date) // Validate if it's a Date object
  ) {
    console.error('Order validation failed: ', order)
    return false
  }
  return true
}

// Assuming buyOrder.trades and sellOrder.trades are stringified JSON arrays in the database
export function addTradeToOrder(order: Order, trade: TradeDetail) {
  let trades: TradeDetail[] = []

  if (order.trades) {
    try {
      trades = JSON.parse(order.trades)
    } catch (e) {
      console.error('Error parsing trades', e)
    }
  }

  const mergedTrades = [...trades, trade].sort((a, b) => {
    return a.timestamp - b.timestamp
  })

  // Update the order's trades
  order.trades = JSON.stringify(mergedTrades, BigIntReplacer)
  return order.trades
}

export function sortOrders(orders: Order[], isBuy: boolean): Order[] {
  return orders.sort((a, b) => {
    const priceComparison = isBuy
      ? Number(b.price - a.price)
      : Number(a.price - b.price)
    if (priceComparison !== 0) return priceComparison

    if (a.created_at < b.created_at) return -1
    if (a.created_at > b.created_at) return 1
    return 0
  })
}
