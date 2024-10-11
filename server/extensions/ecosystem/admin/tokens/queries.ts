import type { EcosystemToken } from '../../../../types'
import prisma from '../../../../utils/prisma'

export async function getAllEcosystemTokens(
  filter: string = '',
  perPage: number = 10,
  page: number = 1,
) {
  const skip = (page - 1) * perPage

  // Find the filtered result and the total count
  const [tokens, totalCount] = await prisma.$transaction([
    prisma.ecosystem_token.findMany({
      where: {
        OR: [
          {
            name: {
              contains: filter,
            },
          },
          {
            currency: {
              contains: filter.toUpperCase(),
            },
          },
        ],
      },
      take: perPage,
      skip: skip,
    }),
    prisma.ecosystem_token.count({
      where: {
        OR: [
          {
            name: {
              contains: filter,
            },
          },
          {
            currency: {
              contains: filter.toUpperCase(),
            },
          },
        ],
      },
    }),
  ])

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / perPage)

  // Format the response to include pagination metadata
  const paginatedResponse = {
    data: tokens as unknown as EcosystemToken[],
    pagination: {
      totalItems: totalCount,
      currentPage: page,
      pageSize: perPage,
      totalPages: totalPages,
    },
  }

  return paginatedResponse
}

export async function getEcosystemTokensAll(): Promise<EcosystemToken[]> {
  return (await prisma.ecosystem_token.findMany()) as unknown as EcosystemToken[]
}

// Fetch a single token by ID
export async function getEcosystemTokenById(
  chain: string,
  currency: string,
): Promise<EcosystemToken | null> {
  return (await prisma.ecosystem_token.findFirst({
    where: {
      chain,
      currency,
    },
  })) as unknown as EcosystemToken
}

// Fetch a single token by ID
export async function getEcosystemTokensByChain(
  chain: string,
): Promise<EcosystemToken | null> {
  return (await prisma.ecosystem_token.findMany({
    where: {
      chain,
      network: process.env[`${chain}_NETWORK`],
    },
  })) as unknown as EcosystemToken
}

// Create a new token
export async function createEcosystemToken(
  chain: string,
  name: string,
  currency: string,
  contract: string,
  decimals: number,
  type: string,
  network?: string,
): Promise<EcosystemToken> {
  return (await prisma.ecosystem_token.create({
    data: {
      chain,
      name,
      currency,
      contract,
      decimals,
      type,
      network,
      status: true,
      contractType: 'PERMIT',
    },
  })) as unknown as EcosystemToken
}

export async function importEcosystemToken(
  name: string,
  currency: string,
  chain: string,
  network: string,
  type: string,
  contract: string,
  decimals: number,
  contractType: 'PERMIT' | 'NO_PERMIT',
): Promise<EcosystemToken> {
  return (await prisma.ecosystem_token.create({
    data: {
      name,
      currency,
      chain,
      network,
      type,
      contract,
      decimals,
      status: true,
      contractType,
    },
  })) as unknown as EcosystemToken
}

export async function updateAdminTokenIcon(
  id: number,
  icon: string,
): Promise<EcosystemToken> {
  return (await prisma.ecosystem_token.update({
    where: {
      id: Number(id),
    },
    data: {
      icon,
    },
  })) as unknown as EcosystemToken
}

export async function getTokenDecimal() {
  const tokens = await prisma.ecosystem_token.findMany({
    select: {
      currency: true,
      decimals: true,
    },
  })

  // Create an object to hold token:decimal pairs
  const tokenDecimals: { [key: string]: number } = {}
  for (const { currency, decimals } of tokens) {
    tokenDecimals[currency] = decimals
  }

  return tokenDecimals
}

export async function getNoPermitTokens(chain: string) {
  return (await prisma.ecosystem_token.findMany({
    where: {
      chain,
      contractType: 'NO_PERMIT',
      network: process.env[`${chain}_NETWORK`],
      status: true,
    },
  })) as unknown as EcosystemToken[]
}

export async function updateStatusBulk(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.ecosystem_token.updateMany({
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

export async function updateAdminToken(
  id: number,
  precision: number,
  limits: any,
  fees: any,
): Promise<EcosystemToken> {
  return (await prisma.ecosystem_token.update({
    where: {
      id: Number(id),
    },
    data: {
      precision,
      limits,
      fees,
    },
  })) as unknown as EcosystemToken
}
