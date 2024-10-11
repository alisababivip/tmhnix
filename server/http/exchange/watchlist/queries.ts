import type { ExchangeWatchlist, ExchangeWatchlistType } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getWatchlists(
  userId: number,
): Promise<ExchangeWatchlist[]> {
  return (await prisma.exchange_watchlist.findMany({
    where: {
      user_id: userId,
    },
  })) as unknown as ExchangeWatchlist[]
}

export async function createWatchlist(
  userId: number,
  symbol: string,
  type: ExchangeWatchlistType,
): Promise<ExchangeWatchlist | void> {
  if (!symbol || !type) {
    throw new Error('Missing required parameters: symbol, or type.')
  }

  const existingWatchlist = await prisma.exchange_watchlist.findFirst({
    where: {
      user_id: userId,
      symbol,
      type,
    },
  })

  if (existingWatchlist) {
    // If a watchlist with the same userId, type, and symbol already exists, remove it
    await prisma.exchange_watchlist.delete({
      where: {
        id: existingWatchlist.id,
      },
    })
    return
  }

  // Otherwise, create a new watchlist entry
  return (await prisma.exchange_watchlist.create({
    data: {
      user_id: userId,
      symbol,
      type,
    },
  })) as unknown as ExchangeWatchlist
}

export async function deleteWatchlist(id: number): Promise<void> {
  await prisma.exchange_watchlist.delete({
    where: {
      id,
    },
  })
}
