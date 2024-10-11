// adminWalletQueries.ts
import type { EcosystemMasterWallet, Web3WalletData } from '../../../../types' // Import the type if you have it defined elsewhere
import { makeUuid } from '../../../../utils/passwords'
import prisma from '../../../../utils/prisma'

const walletSelect = {
  uuid: true,
  currency: true,
  chain: true,
  address: true,
  status: true,
  balance: true,
}

// Fetch all master wallets
export async function getAllMasterWallets(): Promise<EcosystemMasterWallet[]> {
  return (await prisma.ecosystem_master_wallet.findMany({
    select: walletSelect,
  })) as unknown as EcosystemMasterWallet[]
}

// Fetch a single master wallet by ID
export async function getMasterWalletById(
  uuid: string,
): Promise<EcosystemMasterWallet | null> {
  return (await prisma.ecosystem_master_wallet.findUnique({
    where: {
      uuid: uuid,
    },
    select: walletSelect,
  })) as unknown as EcosystemMasterWallet
}

export async function getMasterWallet(
  uuid: string,
): Promise<EcosystemMasterWallet | null> {
  return (await prisma.ecosystem_master_wallet.findUnique({
    where: {
      uuid: uuid,
    },
  })) as unknown as EcosystemMasterWallet
}

export async function getMasterWalletByChain(
  chain: string,
): Promise<EcosystemMasterWallet | null> {
  return (await prisma.ecosystem_master_wallet.findFirst({
    where: {
      chain: chain,
    },
    select: walletSelect,
  })) as unknown as EcosystemMasterWallet
}

export async function getMasterWalletByChainFull(
  chain: string,
): Promise<EcosystemMasterWallet | null> {
  return (await prisma.ecosystem_master_wallet.findFirst({
    where: {
      chain: chain,
    },
  })) as unknown as EcosystemMasterWallet
}

// Create a new master wallet
export async function createMasterWallet(
  walletData: Web3WalletData,
  currency: string,
): Promise<EcosystemMasterWallet> {
  const wallet = (await prisma.ecosystem_master_wallet.create({
    data: {
      uuid: makeUuid(),
      currency: currency,
      chain: walletData.chain,
      address: walletData.address,
      data: walletData.data,
      status: 'ACTIVE',
    },
  })) as unknown as EcosystemMasterWallet

  wallet.data = ['hidden']
  return wallet
}

export async function updateMasterWalletBalance(
  uuid: string,
  balance: number,
): Promise<EcosystemMasterWallet> {
  return (await prisma.ecosystem_master_wallet.update({
    where: {
      uuid: uuid,
    },
    data: {
      balance: balance,
    },
  })) as unknown as EcosystemMasterWallet
}
