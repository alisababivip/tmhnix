import type { Wallet } from '~~/types'
import { createLogger } from '../../../../logger'
import { handleController } from '../../../../utils'
import prisma from '../../../../utils/prisma'
import { fromBigInt, toBigIntFloat } from '../../utils/blockchain'
import type { Order } from '../../utils/scylla/queries'
import {
  cancelOrderByUuid,
  createOrder,
  getHistoricalCandles,
  getLastCandle,
  getOrderByUuid,
  getOrdersByUserId,
} from '../../utils/scylla/queries'
import { getMarketBySymbol } from '../markets/queries'
import { getWalletOnly } from '../wallets/queries'
import { MatchingEngine } from './matchingEngine'

const logger = createLogger('Ecosystem Orders Controller')

export const controllers = {
  index: handleController(async (_, __, ___, query, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { symbol } = query
      const orders = await getOrdersByUserId(user.id)
      const ordersBigIntToString = orders
        .filter((order: Order) => order.symbol === symbol)
        .map((order: Order) => ({
          ...order,
          amount: fromBigInt(order.amount),
          price: fromBigInt(order.price),
          cost: fromBigInt(order.cost),
          fee: fromBigInt(order.fee),
          filled: fromBigInt(order.filled),
          remaining: fromBigInt(order.remaining),
        }))
      return ordersBigIntToString
    } catch (error: any) {
      logger.error(`Failed to fetch orders by user_id: ${error.message}`)
      throw new Error(`Failed to fetch orders by user_id: ${error.message}`)
    }
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { symbol, amount, price, type, side } = body

      const [currency, pair] = symbol.split('/')
      if (!currency || !pair) {
        throw new Error('Invalid symbol')
      }

      // Fetch fee rates from metadata or other sources
      const market = await getMarketBySymbol(symbol)

      const feeRate =
        side === 'BUY' ? market.metadata.taker : market.metadata.maker

      // Calculate fee based on the fee rate
      const fee = (amount * price * feeRate) / 100

      // Calculate the total cost. Adjust this formula as needed.
      const cost = side === 'BUY' ? amount * price + fee : amount // For 'SELL', the cost is just the amount

      const currencyWallet = await getWalletOnly(user.id, currency)
      if (!currencyWallet) {
        throw new Error('Currency wallet not found')
      }

      const pairWallet = await getWalletOnly(user.id, pair)
      if (!pairWallet) {
        throw new Error('Pair wallet not found')
      }

      if (side === 'BUY' && pairWallet.balance < cost) {
        throw new Error(`Insufficient balance. You need ${cost} ${pair}`)
      } else if (side !== 'BUY' && currencyWallet.balance < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ${currency}`)
      }

      const newOrder = await createOrder(
        user.id,
        symbol,
        toBigIntFloat(amount),
        toBigIntFloat(price),
        toBigIntFloat(cost),
        type,
        side,
        toBigIntFloat(fee),
        pair,
      )

      const order = {
        ...newOrder,
        amount: fromBigInt(newOrder.amount),
        price: fromBigInt(newOrder.price),
        cost: fromBigInt(newOrder.cost),
        fee: fromBigInt(newOrder.fee),
        remaining: fromBigInt(newOrder.remaining),
        filled: 0,
        average: 0,
      }

      if (side === 'BUY') {
        await updateWalletBalance(pairWallet, order.cost, 'subtract')
      } else {
        await updateWalletBalance(currencyWallet, order.amount, 'subtract')
      }

      return {
        message: 'Order created successfully',
        ...order,
      }
    } catch (error: any) {
      logger.error(`Failed to create new order: ${error.message}`)
      throw new Error(`Failed to create new order: ${error.message}`)
    }
  }),

  cancel: handleController(async (_, __, params, ___, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { uuid } = params
      const { created_at } = body
      const order = await getOrderByUuid(user.id, uuid, created_at)

      if (!order) {
        throw new Error('Order not found')
      }
      if (order.status !== 'OPEN') {
        throw new Error('Order is not open')
      }

      if (
        BigInt(order.filled) !== BigInt(0) &&
        BigInt(order.remaining) !== BigInt(0)
      ) {
        throw new Error('Order is already partially filled')
      }
      if (BigInt(order.remaining) === BigInt(0)) {
        throw new Error('Order is already filled')
      }

      await cancelOrderByUuid(
        user.id,
        uuid,
        created_at,
        order.symbol,
        BigInt(order.price),
        order.side,
        BigInt(order.amount),
      )

      // Refund logic
      const refundAmount =
        order.side === 'BUY' ? fromBigInt(order.cost) : fromBigInt(order.amount)
      const walletCurrency =
        order.side === 'BUY'
          ? order.symbol.split('/')[1]
          : order.symbol.split('/')[0]
      const wallet = await getWalletOnly(user.id, walletCurrency)
      if (!wallet) {
        throw new Error(`${walletCurrency} wallet not found`)
      }

      await updateWalletBalance(wallet, refundAmount, 'add')

      const matchingEngine = await MatchingEngine.getInstance()
      await matchingEngine.handleOrderCancellation(uuid, order.symbol)

      return {
        message: 'Order cancelled and balance refunded successfully',
      }
    } catch (error: any) {
      throw new Error(`Failed to cancel order: ${error.message}`)
    }
  }),

  getHistorical: handleController(async (_, __, ___, query, ____, user) => {
    if (!user) throw new Error('User not found')

    try {
      const { symbol, from, to, interval } = query
      if (
        typeof from === 'undefined' ||
        typeof to === 'undefined' ||
        typeof interval === 'undefined'
      ) {
        throw new Error('Both `from`, `to`, and `interval` must be provided.')
      }

      // Fetch the orders
      const bars = await getHistoricalCandles(
        symbol,
        interval,
        Number(from),
        Number(to),
      )

      return bars
    } catch (error: any) {
      logger.error(`Failed to fetch historical data: ${error.message}`)
      throw new Error(`Failed to fetch historical data: ${error.message}`)
    }
  }),

  ticker: handleController(async (_, __, ___, query, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { symbol } = query
      const ticker = await getLastCandle(symbol)
      return ticker
    } catch (error: any) {
      logger.error(`Failed to fetch ticker data: ${error.message}`)
      throw new Error(`Failed to fetch ticker data: ${error.message}`)
    }
  }),
}

export async function updateWalletBalance(
  wallet: Wallet,
  balanceChange: number,
  type: 'add' | 'subtract',
): Promise<any> {
  if (!wallet) throw new Error('Wallet not found')

  let newBalance: number

  // Function to round to 4 decimal places
  const roundTo4DecimalPlaces = (num: number) =>
    Math.round((num + Number.EPSILON) * 1e8) / 1e8

  switch (type) {
    case 'add':
      newBalance = roundTo4DecimalPlaces(wallet.balance + balanceChange)
      break
    case 'subtract':
      newBalance = roundTo4DecimalPlaces(wallet.balance - balanceChange)
      break
    default:
      throw new Error('Invalid type specified for updating wallet balance.')
  }

  // Update the wallet and log the response
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: newBalance,
    },
  })

  return updatedWallet
}
