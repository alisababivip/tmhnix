import type { EcosystemToken } from '../../../../types'
import prisma from '../../../../utils/prisma'

const currencySelect = {
  name: true,
  currency: true,
  chain: true,
  type: true,
  status: true,
  precision: true,
  limits: true,
  decimals: true,
  icon: true,
  contractType: true,
  network: true,
  fees: true,
}
// Fetch all tokens
export async function getTokens(): Promise<EcosystemToken[]> {
  const tokens = await prisma.ecosystem_token.findMany({
    where: {
      status: true,
    },
    select: currencySelect,
  })
  return tokens.filter(
    (token) => token.network === process.env[`${token.chain}_NETWORK`],
  ) as unknown as EcosystemToken[]
}

// Fetch a single token by ID
export async function getToken(
  chain: string,
  currency: string,
): Promise<EcosystemToken | null> {
  return (await prisma.ecosystem_token.findFirst({
    where: {
      chain,
      currency,
      network: process.env[`${chain}_NETWORK`],
    },
    select: currencySelect,
  })) as unknown as EcosystemToken
}

// Fetch a single token by ID
export async function getTokenByCurrency(
  currency: string,
): Promise<EcosystemToken | null> {
  return (await prisma.ecosystem_token.findFirst({
    where: {
      currency,
    },
  })) as unknown as EcosystemToken
}

// Fetch a single token by ID
export async function getTokenFull(
  chain: string,
  currency: string,
): Promise<EcosystemToken | null> {
  return (await prisma.ecosystem_token.findFirst({
    where: {
      chain,
      currency,
      network: process.env[`${chain}_NETWORK`],
    },
  })) as unknown as EcosystemToken
}

export async function getActiveTokensByCurrency(
  currency: string,
): Promise<EcosystemToken[]> {
  const tokens = await prisma.ecosystem_token.findMany({
    where: { currency, status: true },
  })
  return tokens.filter(
    (token) => token.network === process.env[`${token.chain}_NETWORK`],
  ) as unknown as EcosystemToken[]
}
