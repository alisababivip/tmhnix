import { createLogger } from '~~/logger'
import { handleController } from '../../../../utils'
import { fromBigInt } from '../../utils/blockchain'
import type { Order } from '../../utils/scylla/queries'
import {
  deleteAllMarketData,
  getOrdersByParams,
} from '../../utils/scylla/queries'
import {
  createMarket,
  deleteMarket,
  getMarket,
  getMarkets,
  updateMarket,
  updateMarketsStatus,
} from './queries'
const logger = createLogger('Ecosystem Market Controller')

export const controllers = {
  index: handleController(async () => {
    return await getMarkets()
  }),

  show: handleController(async (_, __, params) => {
    return await getMarket(Number(params.id))
  }),

  store: handleController(async (_, __, ___, ____, body) => {
    const { currency, pair, metadata, is_trending, is_hot } = body
    const response = await createMarket(
      currency,
      pair,
      metadata,
      is_trending,
      is_hot,
    )

    return response
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const { metadata, is_hot, is_trending } = body
    const response = await updateMarket(
      Number(params.id),
      metadata,
      is_trending,
      is_hot,
    )
    return response
  }),

  updateStatus: handleController(async (_, __, ___, ____, body) => {
    await updateMarketsStatus(body.ids, body.status)

    return {
      message: 'Markets updated successfully',
    }
  }),

  destroy: handleController(async (_, __, params) => {
    try {
      const market = await getMarket(Number(params.id))
      if (!market) throw new Error('Market not found')
      await deleteAllMarketData(market.symbol)
      await deleteMarket(Number(params.id))

      return {
        message: 'Market deleted successfully',
      }
    } catch (error) {
      throw new Error(`Market deletion failed: ${error.message}`)
    }
  }),

  orders: handleController(async (_: any, __: any, ___: any, query: any) => {
    try {
      // Destructure the required query parameters
      const { user, symbol, status, side } = query

      // Fetch the orders based on the query parameters
      const orders = await getOrdersByParams(user, symbol, status, side)

      // Convert BigInt to String (or any other transformation you need)
      const ordersBigIntToString = orders.map((order: Order) => ({
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
}
