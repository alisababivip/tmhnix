import type { Currency } from '../../types'

import prisma from '../../utils/prisma'

// Constants for Error Messages
const CURRENCY_NOT_FOUND = 'Currency not found'

// Helper Functions
async function findCurrencyById(id: number) {
  const currency = await prisma.currency.findUnique({
    where: { id },
  })
  if (!currency) throw new Error(CURRENCY_NOT_FOUND)
  return currency
}

export async function getCurrencies(): Promise<Currency[]> {
  return await prisma.currency.findMany({
    where: { status: true },
    orderBy: { code: 'asc' },
  })
}

export async function getCurrency(id: number): Promise<Currency | null> {
  return await findCurrencyById(id)
}

export async function updateCurrencyRates(
  rates: Record<string, number>,
): Promise<void> {
  const updatePromises = Object.keys(rates).map((code) => {
    return prisma.currency.updateMany({
      where: { code },
      data: {
        price: rates[code],
      },
    })
  })

  await Promise.all(updatePromises)
}
