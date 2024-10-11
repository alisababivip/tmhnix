import type { EcosystemMarket } from '../../../../types'

import prisma from '../../../../utils/prisma'

export async function getMarkets(): Promise<EcosystemMarket[]> {
  return prisma.ecosystem_market.findMany({
    where: {
      status: true,
    },
  }) as unknown as EcosystemMarket[]
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
      symbol,
    },
  }) as unknown as EcosystemMarket
}
