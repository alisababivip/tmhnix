import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getTotalMasterWallets(): Promise<number> {
  return await prisma.ecosystem_master_wallet.count()
}

export async function getActiveMasterWallets(): Promise<number> {
  return await prisma.ecosystem_master_wallet.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getTotalCustodialWallets(): Promise<number> {
  return await prisma.ecosystem_custodial_wallet.count()
}

export async function getActiveCustodialWallets(): Promise<number> {
  return await prisma.ecosystem_custodial_wallet.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getTotalTokens(): Promise<number> {
  return await prisma.ecosystem_token.count()
}

export async function getActiveTokens(): Promise<number> {
  return await prisma.ecosystem_token.count({
    where: {
      status: true,
    },
  })
}

export async function getTotalMarkets(): Promise<number> {
  return await prisma.ecosystem_market.count()
}

export async function getActiveMarkets(): Promise<number> {
  return await prisma.ecosystem_market.count({
    where: {
      status: true,
    },
  })
}
