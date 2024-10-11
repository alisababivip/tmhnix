import type { User } from '~~/types'
import {
  TransactionType,
  type DepositGateway,
  type DepositMethod,
  type Transaction,
  type Wallet,
  type WithdrawMethod,
} from '~~/types'
import { sendFiatTransactionEmail } from '~~/utils/emails'
import { makeUuid } from '~~/utils/passwords'

import prisma from '~~/utils/prisma'

export async function getDepositGateways(): Promise<DepositGateway[]> {
  return prisma.deposit_gateway.findMany() as unknown as DepositGateway[]
}

export async function getDepositGateway(
  id: number,
): Promise<DepositGateway | null> {
  return prisma.deposit_gateway.findUnique({
    where: { id },
  }) as unknown as DepositGateway
}

export async function getDepositMethods(): Promise<DepositMethod[]> {
  return (await prisma.deposit_method.findMany()) as unknown as DepositMethod[]
}

export async function getDepositMethod(id: number): Promise<DepositMethod> {
  return (await prisma.deposit_method.findUnique({
    where: { id },
  })) as unknown as DepositMethod
}

export async function getWithdrawMethods(): Promise<WithdrawMethod[]> {
  return (await prisma.withdraw_method.findMany()) as unknown as WithdrawMethod[]
}

export async function getWithdrawMethod(
  id: number,
): Promise<WithdrawMethod | null> {
  return (await prisma.withdraw_method.findUnique({
    where: { id },
  })) as unknown as WithdrawMethod
}

export async function updateWallet(uuid: string, data: any): Promise<Wallet> {
  return (await prisma.wallet.update({
    where: { uuid: uuid },
    data: data.wallet,
  })) as unknown as Wallet
}

export async function depositFiat(
  userId: number,
  transaction: Partial<Transaction>,
  currency: string,
): Promise<Transaction> {
  const user = (await prisma.user.findUnique({
    where: { id: userId },
  })) as unknown as User
  if (!user) {
    throw new Error('User not found')
  }

  // If it exists, return it without making any changes
  if (transaction.reference_id) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference_id: transaction.reference_id },
    })
    if (existingTransaction) {
      return existingTransaction as unknown as Transaction
    }
  }

  // Find the user's wallet
  const wallet = await prisma.wallet.findFirst({
    where: { user_id: user.id, currency: currency },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const walletBalance = Number(wallet.balance)
  let newBalance = 0
  switch (transaction.type) {
    case TransactionType.DEPOSIT:
      newBalance = walletBalance + transaction.amount
      break
    case TransactionType.WITHDRAW:
      newBalance = walletBalance - transaction.amount
      break
    case TransactionType.PAYMENT:
      newBalance = walletBalance - transaction.amount
      break
    case TransactionType.OUTGOING_TRANSFER:
      newBalance = walletBalance - transaction.amount
      break
    case TransactionType.INCOMING_TRANSFER:
      newBalance = walletBalance + transaction.amount
      break
    default:
      break
  }

  // Start a Prisma transaction
  const createdTransaction = await prisma.$transaction([
    // Create a new transaction
    prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: user.id,
        wallet_id: wallet.id,
        ...transaction,
      } as any,
    }),
    // Update the wallet's balance
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
  ])

  const newTransaction = await prisma.transaction.findUnique({
    where: { id: createdTransaction[0].id },
    include: { wallet: true },
  })
  await sendFiatTransactionEmail(user, newTransaction, newBalance)

  return createdTransaction[0] as unknown as Transaction
}

export async function withdrawFiat(
  userId: number,
  walletUuid: string,
  methodId: number,
  amount: number,
  total: number,
  custom_data: any,
): Promise<void> {
  const wallet = await prisma.wallet.findFirst({
    where: { uuid: walletUuid },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const method = await prisma.withdraw_method.findUnique({
    where: { id: methodId },
  })

  if (!method) {
    throw new Error('Withdraw method not found')
  }

  const walletBalance = Number(wallet.balance)
  const newBalance = walletBalance - total

  // Start a Prisma transaction
  await prisma.$transaction([
    // Update the wallet's balance
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
    // Create a new transaction
    prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        type: 'WITHDRAW',
        amount: total,
        fee: total - amount,
        metadata: {
          method: method.title,
          custom_data: custom_data,
        },
        description: `Withdraw ${amount} ${wallet.currency} by ${method.title}`,
      },
    }),
  ])
}

export async function customFiatDepositMethod(
  userId: number,
  walletUuid: string,
  methodId: number,
  amount: number,
  total: number,
  custom_data: any,
): Promise<void> {
  const wallet = await prisma.wallet.findFirst({
    where: { uuid: walletUuid },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const method = await prisma.deposit_method.findUnique({
    where: { id: methodId },
  })

  if (!method) {
    throw new Error('Deposit method not found')
  }

  // Start a Prisma transaction
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        type: 'DEPOSIT',
        amount: total,
        fee: total - amount,
        status: 'PENDING',
        metadata: {
          method: method.title,
          custom_data: custom_data,
        },
        description: `Deposit ${amount} ${wallet.currency} by ${method.title}`,
      },
    }),
  ])
}
