import prisma from '../../../../utils/prisma'

interface SelectedWallet {
  id: number
  user: {
    id: string
    uuid: string
    first_name: string
    last_name: string
  }
}

export interface EcosystemPrivateLedger {
  id: number
  wallet_id: number
  index: number
  currency: string
  chain: string
  offchain_difference: number
  wallet: SelectedWallet
  network: string
}

export async function getLedgers(): Promise<EcosystemPrivateLedger[]> {
  try {
    const ledgers = await prisma.ecosystem_private_ledger.findMany({
      select: {
        id: true,
        wallet_id: true,
        index: true,
        currency: true,
        chain: true,
        offchain_difference: true,
        network: true,
        wallet: {
          select: {
            uuid: true,
            balance: true,
            user: {
              select: {
                uuid: true,
                first_name: true,
                last_name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
    return ledgers.filter(
      (ledger) => ledger.network === process.env[`${ledger.chain}_NETWORK`],
    ) as unknown as EcosystemPrivateLedger[]
  } catch (error) {
    console.error('Error fetching ledgers:', error)
    throw new Error('Could not fetch ledgers')
  }
}
