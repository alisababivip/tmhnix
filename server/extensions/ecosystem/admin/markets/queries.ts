import type { EcosystemMarket } from '../../../../types'

import prisma from '../../../../utils/prisma'

export async function getMarkets(): Promise<EcosystemMarket[]> {
  return prisma.ecosystem_market.findMany() as unknown as EcosystemMarket[]
}

export async function getMarket(id: number): Promise<EcosystemMarket> {
  return prisma.ecosystem_market.findUnique({
    where: {
      id: id,
    },
  }) as unknown as EcosystemMarket
}

export async function getMarketBySymbol(
  symbol: string,
): Promise<EcosystemMarket> {
  return prisma.ecosystem_market.findUnique({
    where: {
      symbol: symbol,
    },
  }) as unknown as EcosystemMarket
}

export async function createMarket(
  currency: string,
  pair: string,
  metadata: any,
  is_trending?: boolean,
  is_hot?: boolean,
): Promise<EcosystemMarket> {
  const market = await prisma.ecosystem_market.findUnique({
    where: {
      symbol: currency + '/' + pair,
    },
  })

  if (market) {
    throw new Error('Market already exists')
  }
  return (await prisma.ecosystem_market.create({
    data: {
      symbol: currency + '/' + pair,
      pair,
      metadata,
      is_trending,
      is_hot,
      status: true,
    },
  })) as unknown as EcosystemMarket
}

export async function updateMarket(
  id: number,
  metadata?: any,
  is_trending?: boolean,
  is_hot?: boolean,
): Promise<EcosystemMarket> {
  return (await prisma.ecosystem_market.update({
    where: {
      id: id,
    },
    data: {
      metadata,
      is_trending,
      is_hot,
    },
  })) as unknown as EcosystemMarket
}

export async function updateMarketsStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.ecosystem_market.updateMany({
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

export async function deleteMarket(id: number): Promise<void> {
  await prisma.ecosystem_market.delete({
    where: {
      id: id,
    },
  })
}
