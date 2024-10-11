import type { BinaryOrder } from '../../../../types'
import { handleController } from '../../../../utils'
import ExchangeManager from '../../../../utils/exchange'
import {
  cancelBinaryOrder,
  createBinaryOrder,
  getBinaryOrder,
  getBinaryOrders,
  getBinaryOrdersByStatus,
  updateBinaryOrder,
} from './queries'

const orderIntervals = new Map<string, NodeJS.Timeout>()

export const controllers = {
  index: handleController(async (_, __, ___, query, ____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    const { type } = query
    return getBinaryOrders(user.id, type)
  }),

  show: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    return getBinaryOrder(user.id, params.uuid)
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }
    try {
      const transaction = await createBinaryOrder(user.id, body.order)

      startOrderMonitoring(
        user.id,
        transaction.uuid,
        body.order.symbol,
        new Date(body.order.closed_at).getTime(),
      )

      return transaction
    } catch (error) {
      throw new Error(error)
    }
  }),

  cancel: handleController(async (_, __, params, ____, body) => {
    return cancelBinaryOrder(params.uuid, body.percentage)
  }),

  processPending: handleController(async () => {
    return await processPendingOrders()
  }),

  cron: handleController(async () => {
    try {
      await processPendingOrders()
    } catch (error) {
      throw new Error(error)
    }
  }),
}

function startOrderMonitoring(
  userId: number,
  orderUuid: string,
  symbol: string,
  closedAt: number,
) {
  const currentTimeUtc = new Date().getTime()
  const delay = closedAt - currentTimeUtc

  const timer = setTimeout(() => {
    processOrder(userId, orderUuid, symbol)
  }, delay)

  orderIntervals.set(orderUuid, timer)
}
async function processOrder(userId: number, orderUuid: string, symbol: string) {
  try {
    const exchange = await (ExchangeManager as any).startExchange()
    const provider = await (ExchangeManager as any).provider

    let data
    switch (provider) {
      case 'kucoin':
      case 'binance':
      case 'bitget':
        data = await exchange.fetchTicker(symbol)
        break
      default:
        throw new Error('Provider not supported')
    }

    const order = await getBinaryOrder(userId, orderUuid)
    const price = data.last

    const updateData: Partial<BinaryOrder> = determineOrderStatus(order, price)

    // Update the order in the database
    await updateBinaryOrder(orderUuid, updateData)

    // Remove the timeout entry for this order (optional, since it has already executed)
    orderIntervals.delete(orderUuid)
  } catch (error) {
    console.error(`Error fetching OHLCV data for order ${orderUuid}: ${error}`)
  }
}

export async function processPendingOrders() {
  try {
    const pendingOrders = await getBinaryOrdersByStatus('PENDING')

    const currentTime = new Date().getTime()

    const unmonitoredOrders = pendingOrders.filter((order) => {
      const closedAtTime = new Date(order.closed_at).getTime()
      return closedAtTime <= currentTime && !orderIntervals.has(order.uuid)
    })

    const exchange = await (ExchangeManager as any).startExchange()

    for (const order of unmonitoredOrders) {
      const timeframe = '1m'
      const ohlcv = await exchange.fetchOHLCV(
        order.symbol,
        timeframe,
        Number(order.closed_at) - 60000,
        2,
      )
      const closePrice = ohlcv[1][4]
      const updateData = determineOrderStatus(order, closePrice)
      await updateBinaryOrder(order.uuid, updateData)
    }
  } catch (error) {
    console.error('Error processing pending orders:', error)
  }
}

function determineOrderStatus(order: any, closePrice: number): any {
  const updateData: any = {
    close_price: closePrice,
  }

  switch (order.type) {
    case 'RISE_FALL':
      if (order.side === 'RISE' && closePrice > order.price) {
        updateData.status = 'WIN'
      } else if (order.side === 'FALL' && closePrice < order.price) {
        updateData.status = 'WIN'
      } else if (closePrice === order.price) {
        updateData.status = 'DRAW'
      } else {
        updateData.status = 'LOSS'
        updateData.profit = 100
      }
      break
  }

  return updateData
}
