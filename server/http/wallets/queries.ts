import type { Transaction, User, Wallet, WalletType } from '../../types'
import {
  sendIncomingTransferEmail,
  sendOutgoingTransferEmail,
} from '../../utils/emails'
import { makeUuid } from '../../utils/passwords'

import prisma from '../../utils/prisma'

export async function getWallets(
  userId: number,
  transactions: boolean,
): Promise<Wallet[]> {
  return (await prisma.wallet.findMany({
    where: { user_id: userId },
    include: { transactions: transactions },
  })) as unknown as Wallet[]
}

export async function getWallet(uuid: string): Promise<Wallet | null> {
  return (await prisma.wallet.findUnique({
    where: { uuid: uuid },
  })) as unknown as Wallet
}

export async function fetchWallet(
  userId: number,
  currency: string,
  type: WalletType,
): Promise<Wallet | null> {
  return (await prisma.wallet.findFirst({
    where: { user_id: userId, currency: currency, type: type },
  })) as unknown as Wallet
}

export async function fetchWalletsByType(
  userId: number,
  type: WalletType,
  transactions: boolean,
): Promise<Wallet | null> {
  return (await prisma.wallet.findMany({
    where: { user_id: userId, type: type },
    include: { transactions: transactions },
  })) as unknown as Wallet
}

export async function getWalletById(id: number): Promise<Wallet | null> {
  return (await prisma.wallet.findUnique({
    where: { id },
  })) as unknown as Wallet
}

export async function createWallet(
  userId: number,
  currency: string,
  type: WalletType,
): Promise<Wallet> {
  const wallet = await prisma.wallet.findFirst({
    where: { user_id: userId, currency: currency, type: type },
  })
  if (wallet) throw new Error('Wallet already exists')

  return (await prisma.wallet.create({
    data: {
      uuid: makeUuid(),
      user: {
        connect: {
          id: userId,
        },
      },
      currency: currency,
      balance: 0,
      type: type,
    },
  })) as unknown as Wallet
}

export async function getTransactions(uuid: string): Promise<Transaction[]> {
  const wallet = await prisma.wallet.findUnique({
    where: { uuid: uuid },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  return (await prisma.transaction.findMany({
    where: { wallet_id: wallet.id },
  })) as unknown as Transaction[]
}

export async function transferFunds(
  userId: number,
  currency: string,
  type: WalletType,
  amount: number,
  to: string,
): Promise<Transaction> {
  const response = await prisma.$transaction(async (prisma) => {
    const user = (await prisma.user.findFirst({
      where: { id: userId },
    })) as unknown as User

    if (!user) {
      throw new Error('User not found')
    }

    const toUser = (await prisma.user.findFirst({
      where: { uuid: to },
    })) as unknown as User

    if (!toUser) {
      throw new Error('Recipient user not found')
    }

    const wallet = (await prisma.wallet.findFirst({
      where: { user_id: userId, currency: currency, type: type },
    })) as unknown as Wallet

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds')
    }
    const toWallet = (await prisma.wallet.upsert({
      where: {
        wallet_user_id_currency_type_unique: {
          user_id: toUser.id,
          currency: currency,
          type: type,
        },
      },
      update: {},
      create: {
        uuid: makeUuid(),
        user: {
          connect: {
            id: toUser.id,
          },
        },
        currency: currency,
        balance: 0,
        type: type,
        addresses: wallet.addresses,
      },
    })) as unknown as Wallet

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - amount },
    })

    await prisma.wallet.update({
      where: { id: toWallet.id },
      data: { balance: toWallet.balance + amount },
    })

    const fromTransfer = (await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        type: 'OUTGOING_TRANSFER',
        amount: amount,
        fee: 0,
        status: 'COMPLETED',
        description: `${amount} ${currency} transfer to ${toUser.first_name} ${toUser.last_name} ${toWallet.currency} wallet`,
      },
    })) as unknown as Transaction

    const toTransfer = (await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: toUser.id,
        wallet_id: toWallet.id,
        type: 'INCOMING_TRANSFER',
        amount: amount,
        fee: 0,
        status: 'COMPLETED',
        description: `${amount} ${currency} transfer from ${user.first_name} ${user.last_name} ${wallet.currency} wallet`,
      },
    })) as unknown as Transaction

    return {
      user: user,
      toUser: toUser,
      wallet: wallet,
      toWallet: toWallet,
      fromTransfer: fromTransfer,
      toTransfer: toTransfer,
    }
  })

  if (!response) {
    throw new Error('Error transferring funds')
  }

  try {
    await sendOutgoingTransferEmail(
      response.user,
      response.toUser,
      response.wallet,
      amount,
      response.fromTransfer.uuid,
    )
    await sendIncomingTransferEmail(
      response.toUser,
      response.user,
      response.toWallet,
      amount,
      response.toTransfer.uuid,
    )
  } catch (error) {
    console.log('Error sending transfer email: ', error)
  }

  return response.fromTransfer
}
