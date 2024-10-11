import type { BinaryOrder } from '../../../../types'
import { sendBinaryOrderEmail } from '../../../../utils/emails'
import { makeUuid } from '../../../../utils/passwords'

import prisma from '../../../../utils/prisma'

export async function getBinaryOrders(
  user_id: number,
  type: string,
): Promise<BinaryOrder[]> {
  const where = {
    user_id: user_id,
  }
  if (type === 'LIVE') {
    where['is_demo'] = false
  }
  if (type === 'PRACTICE') {
    where['is_demo'] = true
  }
  return (await prisma.binary_orders.findMany({
    where: where,
  })) as unknown as BinaryOrder[]
}

export async function getBinaryOrdersByStatus(
  status: any,
): Promise<BinaryOrder[]> {
  return (await prisma.binary_orders.findMany({
    where: {
      status: status,
    },
  })) as unknown as BinaryOrder[]
}

export async function getBinaryOrder(
  user_id: number,
  uuid: string,
): Promise<BinaryOrder | null> {
  return (await prisma.binary_orders.findUnique({
    where: {
      uuid: uuid,
      user_id: user_id,
    },
  })) as BinaryOrder
}

export async function createBinaryOrder(
  user_id: number,
  order: any,
): Promise<any> {
  let currency, wallet, balance
  const isDemo = order.is_demo || false
  if (!isDemo) {
    currency = order.symbol.split('/')[1]
    wallet = await prisma.wallet.findFirst({
      where: {
        user_id: user_id,
        currency: currency,
        type: 'SPOT',
      },
    })

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    balance = wallet.balance - order.amount
    if (balance < 0) {
      throw new Error('Insufficient balance')
    }
    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: balance,
      },
    })
  }

  const closeAtDate = new Date(order.closed_at)

  const finalOrder = await prisma.binary_orders.create({
    data: {
      uuid: makeUuid(),
      user_id: user_id,
      symbol: order.symbol,
      type: order.type,
      side: order.side,
      status: 'PENDING',
      price: order.price,
      profit: order.profit,
      amount: order.amount,
      is_demo: isDemo,
      closed_at: closeAtDate,
    },
  })

  if (!isDemo) {
    await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: user_id,
        wallet_id: wallet.id,
        type: 'BINARY_ORDER',
        status: 'PENDING',
        amount: order.amount,
        fee: 0,
        description: `Binary Position | Market: ${order.symbol} | Amount: ${
          order.amount
        } ${currency} | Price: ${order.price} | Profit Margin: ${
          order.profit
        }% | Side: ${
          order.side
        } | Expiration: ${order.closed_at.toLocaleString()} | Type: ${
          isDemo ? 'Practice' : 'Live'
        } Position`,
        reference_id: finalOrder.uuid,
      },
    })
  }
  return finalOrder
}

export async function cancelBinaryOrder(
  uuid: string,
  percentage: number,
): Promise<BinaryOrder> {
  const order = await prisma.binary_orders.findUnique({
    where: {
      uuid: uuid,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  let wallet, balance, transaction

  const isDemo = order.is_demo || false
  if (!isDemo) {
    transaction = await prisma.transaction.findUnique({
      where: {
        reference_id: order.uuid,
      },
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    wallet = await prisma.wallet.findUnique({
      where: {
        id: transaction.wallet_id,
      },
    })

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    balance = wallet.balance + order.amount

    if (percentage !== undefined && percentage < 0) {
      const cutAmount = order.amount * (Math.abs(percentage) / 100)
      balance = wallet.balance + order.amount - cutAmount
    }

    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: balance,
      },
    })

    await prisma.transaction.delete({
      where: {
        uuid: transaction.uuid,
      },
    })
  }

  return (await prisma.binary_orders.delete({
    where: {
      uuid: uuid,
    },
  })) as unknown as BinaryOrder
}

export async function updateBinaryOrder(orderId: string, updateData: any) {
  const order = (await prisma.binary_orders.update({
    where: { uuid: orderId },
    data: updateData,
  })) as unknown as BinaryOrder
  if (['WIN', 'LOSS', 'DRAW'].includes(order.status)) {
    const user = await prisma.user.findUnique({
      where: {
        id: order.user_id,
      },
    })
    if (!user) {
      throw new Error('User not found')
    }
    await sendBinaryOrderEmail(user, order)
  }

  let wallet, balance, transaction
  const isDemo = order.is_demo || false
  if (!isDemo) {
    transaction = await prisma.transaction.findUnique({
      where: {
        reference_id: order.uuid,
      },
    })
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    await prisma.transaction.update({
      where: {
        uuid: transaction.uuid,
      },
      data: {
        status: 'COMPLETED',
      },
    })

    wallet = await prisma.wallet.findUnique({
      where: {
        id: transaction.wallet_id,
      },
    })

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    balance = wallet.balance
    switch (order.status) {
      case 'WIN':
        balance += order.amount + order.amount * (order.profit / 100)
        break
      case 'LOSS':
        break
      case 'DRAW':
        balance += order.amount
        break
      case 'CANCELLED':
        balance += order.amount
        break
      case 'PENDING':
        break
    }

    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: balance,
      },
    })
  }
}
