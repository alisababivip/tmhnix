import type { BinaryOrder, ExchangeOrder } from '~~/types'
import prisma from '~~/utils/prisma'

async function getUserID(userUuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
  })
  if (!user) throw new Error('Invalid user UUID')
  return user.id
}

type OrderType = ExchangeOrder | BinaryOrder

export async function getOrders(
  userUuid?: string,
  type?: string,
  status?: string,
  side?: string,
  currency?: string,
): Promise<OrderType[]> {
  // Determine the user ID and wallet ID if uuids are provided
  const userId = userUuid ? await getUserID(userUuid) : undefined

  // Define the where clause based on the provided parameters
  const where: any = {
    user_id: userId,
    status,
    side,
  }

  // Include wallet and user details in the query
  const include = {
    user: {
      select: {
        first_name: true,
        last_name: true,
        uuid: true,
        avatar: true,
      },
    },
  }

  let orders: OrderType[] = []
  // Query the orders based on the where clause and include the wallet and user details
  if (type === 'trade') {
    orders = (await prisma.exchange_orders.findMany({
      where,
      include,
    })) as unknown as OrderType[]
  } else {
    orders = (await prisma.binary_orders.findMany({
      where,
      include,
    })) as unknown as OrderType[]
  }

  if (currency && orders.length > 0) {
    return orders.filter((order: any) => {
      return order.symbol.split('/')[1] === currency
    })
  }

  return orders
}

export async function getOrder(uuid: string, type: string): Promise<any> {
  const order =
    type === 'trade'
      ? ((await prisma.exchange_orders.findUnique({
          where: {
            uuid,
          },
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                uuid: true,
                avatar: true,
              },
            },
          },
        })) as unknown as ExchangeOrder)
      : ((await prisma.binary_orders.findUnique({
          where: {
            uuid,
          },
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                uuid: true,
                avatar: true,
              },
            },
          },
        })) as unknown as BinaryOrder)

  return order
}
