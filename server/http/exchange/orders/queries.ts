import type { ExchangeOrder } from '~~/types'
import { makeUuid } from '~~/utils/passwords'

import prisma from '~~/utils/prisma'

export async function getOrders(userId: number): Promise<ExchangeOrder[]> {
  return prisma.exchange_orders.findMany({
    where: {
      user_id: userId,
    },
  }) as unknown as ExchangeOrder[]
}

export async function getOrder(uuid: string): Promise<ExchangeOrder | null> {
  return prisma.exchange_orders.findUnique({
    where: {
      uuid: uuid,
    },
  }) as unknown as ExchangeOrder
}

const mapOrderDataToPrismaModel = (order: any) => {
  return {
    uuid: makeUuid(),
    reference_id: order.reference_id,
    status: order.status ? order.status.toUpperCase() : undefined,
    symbol: order.symbol,
    type: order.type ? order.type.toUpperCase() : undefined,
    timeInForce: order.timeInForce
      ? order.timeInForce.toUpperCase()
      : undefined,
    side: order.side ? order.side.toUpperCase() : undefined,
    price: Number(order.price),
    average: Number(order.average) || undefined, // Fallback to undefined if not available
    amount: Number(order.amount),
    filled: Number(order.filled),
    remaining: Number(order.remaining),
    cost: Number(order.cost),
    trades: order.trades,
    fee: order.fee,
    fee_currency: order.fee_currency,
  }
}

export async function createOrder(
  userId: number,
  order: any,
): Promise<ExchangeOrder> {
  const mappedOrder = mapOrderDataToPrismaModel(order)
  return prisma.exchange_orders.create({
    data: {
      ...mappedOrder,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  }) as unknown as ExchangeOrder
}

export async function updateOrder(
  uuid: string,
  data: Partial<ExchangeOrder>,
): Promise<void> {
  await prisma.exchange_orders.update({
    where: {
      uuid: uuid,
    },
    data: data as any,
  })
}

export async function updateWalletQuery(
  id: number,
  data: { balance: number },
): Promise<any> {
  return prisma.wallet.update({
    where: {
      id: id,
    },
    data: data,
  })
}
