import type { Transaction, Wallet } from '~~/types'
import { TransactionType } from '~~/types'

import prisma from '~~/utils/prisma'

async function getUserUUID(userUuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
  })
  if (!user) throw new Error('Invalid user UUID')
  return user.id
}

async function getWalletID(walletUuid: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { uuid: walletUuid },
  })
  if (!wallet) throw new Error('Invalid wallet UUID')
  return wallet.id
}

export async function getTransactions(
  userId: number,
  type?: string,
  status?: string,
  walletUuid?: string,
  walletType?: string,
  basic = false,
): Promise<Transaction[]> {
  const walletId = walletUuid
    ? ((await getWalletID(walletUuid)) as unknown as Wallet)
    : undefined

  const types: TransactionType[] = [
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAW,
    TransactionType.PAYMENT,
    TransactionType.INCOMING_TRANSFER,
    TransactionType.OUTGOING_TRANSFER,
  ]
  const where: any = {
    user_id: userId,
  }

  if (status) {
    where.status = status
  }

  // TODO: make it uuid instead of id
  if (walletId) {
    where.wallet_id = walletId
  }
  if (type && !basic) {
    where.type = type
  }
  if (basic) {
    where.type = {
      in: types,
    }
  }
  if (walletType) {
    where.walletType = walletType // Assuming the field name is "walletType" in the transactions table
  }
  // Include wallet and user details in the query
  const include = {
    wallet: { select: { currency: true, type: true } },
    user: {
      select: {
        first_name: true,
        last_name: true,
        uuid: true,
        avatar: true,
      },
    },
  }

  // Query the transactions based on the where clause and include the wallet and user details
  const transactions = await prisma.transaction.findMany({
    where,
    include,
  })

  return transactions as unknown as Transaction[]
}

export async function getTransaction(
  referenceId: string,
): Promise<Transaction | null> {
  return (await prisma.transaction.findUnique({
    where: { uuid: referenceId },
    include: {
      wallet: { select: { currency: true, type: true } },
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
    },
  })) as unknown as Transaction
}
