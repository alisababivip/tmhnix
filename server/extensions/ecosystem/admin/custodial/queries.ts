import type { EcosystemCustodialWallet } from '../../../../types'
import { makeUuid } from '../../../../utils/passwords'
import prisma from '../../../../utils/prisma'

export async function getCustodialWallets(
  chain,
): Promise<EcosystemCustodialWallet[]> {
  return (await prisma.ecosystem_custodial_wallet.findMany({
    where: {
      chain: chain,
    },
  })) as unknown as EcosystemCustodialWallet[]
}

export async function getCustodialWallet(
  uuid,
): Promise<EcosystemCustodialWallet> {
  return (await prisma.ecosystem_custodial_wallet.findUnique({
    where: {
      uuid,
    },
  })) as unknown as EcosystemCustodialWallet
}

export async function getActiveCustodialWallets(
  chain,
): Promise<EcosystemCustodialWallet[]> {
  return (await prisma.ecosystem_custodial_wallet.findMany({
    where: {
      chain: chain,
      status: 'ACTIVE',
    },
  })) as unknown as EcosystemCustodialWallet[]
}

export async function storeCustodialWallet(
  walletId: number,
  chain: string,
  contractAddress: string,
): Promise<EcosystemCustodialWallet> {
  return (await prisma.ecosystem_custodial_wallet.create({
    data: {
      uuid: makeUuid(),
      master_wallet_id: walletId,
      address: contractAddress,
      network: process.env[`${chain}_NETWORK`],
      chain: chain,
      status: 'ACTIVE',
    },
  })) as unknown as EcosystemCustodialWallet
}
