import type { Currency } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getAllCurrencies(): Promise<Currency[]> {
  return await prisma.currency.findMany({
    orderBy: { code: 'asc' },
  })
}

export async function updateCurrency(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.currency.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      status: status,
    },
  })
}
