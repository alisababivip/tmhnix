import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../../types'
import { makeUuid } from '../../../utils/passwords'

import prisma from '../../../utils/prisma'

export async function getWalletQuery(userId: number, currency: string) {
  return await prisma.wallet.findFirst({
    where: {
      user_id: userId,
      currency: currency,
      type: 'SPOT',
    },
    include: {
      transactions: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  })
}

export async function walletExistsQuery(userId: number, currency: string) {
  return await prisma.wallet.findFirst({
    where: {
      user_id: userId,
      currency: currency,
      type: 'SPOT',
    },
  })
}

export async function createWalletQuery(
  userId: number,
  currency: string,
  addresses: any,
) {
  const wallet = await prisma.wallet.create({
    data: {
      uuid: makeUuid(),
      user_id: userId,
      type: 'SPOT',
      currency: currency,
      addresses: addresses,
    },
  })

  // Fetch the wallet with transactions included
  const walletWithTransactions = await prisma.wallet.findUnique({
    where: {
      id: wallet.id,
      type: 'SPOT',
    },
    include: {
      transactions: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  })

  return walletWithTransactions
}

export async function getCurrency(symbol: string): Promise<any> {
  const currency = await prisma.exchange_currency.findFirst({
    where: {
      currency: symbol,
    },
  })

  if (!currency) {
    throw new Error('Currency details not found')
  }
  return currency
}

export async function getTransactionQuery(userId: number, trx: string) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      reference_id: trx,
      user_id: userId,
    },
    include: {
      wallet: {
        select: {
          uuid: true,
          currency: true,
        },
      },
      user: {
        select: {
          uuid: true,
        },
      },
    },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return transaction
}

export async function deleteTransaction(id: number) {
  await prisma.transaction.delete({
    where: {
      id: id,
    },
  })
}

type TransactionUpdateData = {
  amount?: number
  fee?: number
}

export async function updateTransaction(
  id: number,
  status: TransactionStatus,
  data?: TransactionUpdateData,
) {
  await prisma.transaction.update({
    where: {
      id: id,
    },
    data: {
      status: status,
      ...data,
    },
  })
}

export async function updateWalletBalance(
  userId: number,
  currency: string,
  amount: number,
  fee: number,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'REFUND_WITHDRAWAL',
) {
  const wallet = await prisma.wallet.findFirst({
    where: {
      user_id: userId,
      currency: currency,
      type: 'SPOT',
    },
  })

  if (!wallet) {
    return new Error('Wallet not found')
  }

  let balance
  switch (type) {
    case 'WITHDRAWAL':
      balance = wallet.balance - (amount + fee)
      break
    case 'DEPOSIT':
      balance = wallet.balance + (amount - fee)
      break
    case 'REFUND_WITHDRAWAL':
      balance = wallet.balance + amount + fee
      break
    default:
      break
  }

  if (balance < 0) {
    throw new Error('Insufficient balance')
  }

  await prisma.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      balance: balance,
    },
  })

  const updatedWallet = await prisma.wallet.findFirst({
    where: {
      id: wallet.id,
    },
  })

  return updatedWallet
}

export async function transactionExistsQuery(trx: string) {
  return await prisma.transaction.findFirst({
    where: {
      reference_id: trx,
    },
  })
}

export async function createTransaction(userId: number, data: any) {
  // Extract wallet_id from data and remove it from the data object
  const { wallet_id, fee, ...transactionData } = data

  // Validate if the fee is a number
  if (fee && isNaN(parseFloat(fee))) {
    throw new Error('Invalid fee value. Expected a number.')
  }

  const transaction = await prisma.transaction.create({
    data: {
      uuid: makeUuid(),
      user: { connect: { id: userId } },
      wallet: { connect: { id: wallet_id } },
      fee: parseFloat(fee),
      ...transactionData, // Spread the remaining transaction data
    },
  })

  return transaction as unknown as Transaction
}

export async function getPendingTransactionsQuery(type: TransactionType) {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'PENDING',
      type: type,
      NOT: [
        {
          reference_id: null,
        },
        {
          reference_id: '',
        },
      ],
    },
    include: {
      wallet: {
        select: {
          uuid: true,
          currency: true,
        },
      },
    },
  })

  return transactions
}
