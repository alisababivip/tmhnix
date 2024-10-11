import type { ExchangeMarket, ExchangeMarketMetaData } from '../../../types'

import prisma from '../../../utils/prisma'

export async function getMarkets(): Promise<ExchangeMarket[]> {
  return prisma.exchange_market.findMany() as unknown as ExchangeMarket[]
}

export async function getMarket(id: number): Promise<ExchangeMarket> {
  return prisma.exchange_market.findUnique({
    where: {
      id: id,
    },
  }) as unknown as ExchangeMarket
}

export async function updateMarket(
  id: number,
  metadata: Partial<ExchangeMarketMetaData>,
  is_trending: boolean,
  is_hot: boolean,
): Promise<ExchangeMarket> {
  // Check if the market exists
  const existingMarket = await prisma.exchange_market.findUnique({
    where: {
      id: id,
    },
  })

  if (!existingMarket) {
    throw new Error('Market not found')
  }

  // Initialize an empty object for updatedMetadata
  let updatedMetadata: any = {}

  // Check if existingMetadata is actually an object
  if (
    existingMarket.metadata &&
    typeof existingMarket.metadata === 'object' &&
    !Array.isArray(existingMarket.metadata)
  ) {
    // Merge existing metadata with new metadata (only 'taker' and 'maker')
    updatedMetadata = {
      ...existingMarket.metadata,
      taker: metadata.taker,
      maker: metadata.maker,
    }
  } else {
    // If it's not an object, just use the new 'taker' and 'maker'
    updatedMetadata = {
      taker: metadata.taker,
      maker: metadata.maker,
    }
  }

  // Perform the update with the updated metadata
  return (await prisma.exchange_market.update({
    where: {
      id: id,
    },
    data: {
      metadata: updatedMetadata,
      is_trending: is_trending,
      is_hot: is_hot,
    },
  })) as unknown as ExchangeMarket
}

export async function updateMarketsStatus(
  ids: number[],
  status: boolean,
): Promise<boolean> {
  await prisma.exchange_market.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      status: status,
    },
  })
  return true
}
