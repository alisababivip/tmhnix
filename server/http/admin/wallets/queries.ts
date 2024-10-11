import type { Transaction, Wallet } from '~~/types'
import {
  sendTransactionStatusUpdateEmail,
  sendWalletBalanceUpdateEmail,
} from '~~/utils/emails'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'

async function getUserID(userUuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
  })
  if (!user) throw new Error('Invalid user UUID')
  return user.id
}

export async function getWallets(
  filter: string = '',
  perPage: number = 10,
  page: number = 1,
  userUuid?: string,
  type?: string,
  hideSmallBalances?: boolean,
): Promise<{ data: Wallet[]; pagination: any }> {
  // Determine the user ID if userUuid is provided
  const userId = userUuid ? await getUserID(userUuid) : undefined

  // Define the where clause based on the provided parameters
  const where: any = {}
  if (userId) {
    where.user_id = userId
  }
  if (type) {
    where.type = type
  }
  if (filter) {
    // Extend the OR condition to include a check for non-null addresses
    where.OR = [
      { currency: { contains: filter } },
      { uuid: { contains: filter } },
    ]
  }
  if (hideSmallBalances) {
    where.balance = { gt: 0 }
  }

  // Calculate the pagination variables
  const skip = (page - 1) * perPage
  const take = perPage

  // Include user details in the query
  const include = {
    user: {
      select: {
        first_name: true,
        last_name: true,
        uuid: true,
        avatar: true,
      },
    },
  }

  // Execute the paginated query and count query in parallel
  const [wallets, totalCount] = await prisma.$transaction([
    prisma.wallet.findMany({
      where,
      include,
      take,
      skip,
    }),
    prisma.wallet.count({ where }),
  ])

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / perPage)

  // Format the response to include pagination metadata
  const paginatedResponse = {
    data: wallets as unknown as Wallet[],
    pagination: {
      totalItems: totalCount,
      currentPage: page,
      pageSize: perPage,
      totalPages: totalPages,
    },
  }

  return paginatedResponse
}

export async function getWallet(uuid: string): Promise<any | null> {
  return (await prisma.wallet.findUnique({
    where: { uuid: uuid },
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
      transactions: {
        select: {
          id: true,
          uuid: true,
          amount: true,
          fee: true,
          type: true,
          status: true,
          created_at: true,
          metadata: true,
        },
      },
    },
  })) as unknown as Wallet
}

export async function updateWalletBalance(
  uuid: string,
  type: 'ADD' | 'SUBTRACT',
  amount: number,
): Promise<Wallet | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { uuid },
  })

  if (!wallet) throw new Error('Wallet not found')

  // Fetch the user information to pass to the email function
  const user = await prisma.user.findUnique({
    where: { id: wallet.user_id },
  })

  if (!user) throw new Error('User not found')

  const newBalance =
    type === 'ADD' ? wallet.balance + amount : wallet.balance - amount

  if (newBalance < 0) throw new Error('Insufficient funds in wallet')

  const updatedWallet = await prisma.wallet.update({
    where: { uuid },
    data: { balance: newBalance },
  })

  await prisma.transaction.create({
    data: {
      uuid: makeUuid(),
      user_id: wallet.user_id,
      wallet_id: wallet.id,
      amount: amount,
      type: type === 'ADD' ? 'INCOMING_TRANSFER' : 'OUTGOING_TRANSFER',
      status: 'COMPLETED',
      metadata: {
        method: 'ADMIN',
      },
      description: `Admin ${
        type === 'ADD' ? 'added' : 'subtracted'
      } ${amount} ${wallet.currency} to wallet`,
    },
  })

  await sendWalletBalanceUpdateEmail(
    user,
    updatedWallet,
    type === 'ADD' ? 'added' : 'subtracted',
    amount,
    newBalance,
  )

  const returnWallet = await prisma.wallet.findUnique({
    where: { uuid },
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
      transactions: {
        select: {
          id: true,
          uuid: true,
          amount: true,
          fee: true,
          type: true,
          status: true,
          created_at: true,
          metadata: true,
        },
      },
    },
  })

  return returnWallet as unknown as Wallet
}

export async function updateTransactionStatusQuery(
  referenceId: string,
  status: string,
  message?: string,
): Promise<Transaction> {
  const transaction = await prisma.transaction.findUnique({
    where: { uuid: referenceId },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  const updateData: any = {
    status: status,
    metadata: transaction.metadata,
  }

  const wallet = await prisma.wallet.findUnique({
    where: { id: transaction.wallet_id },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  let balance = Number(wallet.balance)

  if (status === 'REJECTED') {
    if (message) {
      updateData.metadata.note = message
    }
    if (transaction.type === 'WITHDRAW') {
      balance += Number(transaction.amount)
    }
  } else if (status === 'COMPLETED') {
    if (transaction.type === 'DEPOSIT') {
      balance += Number(transaction.amount) - Number(transaction.fee)
    }
  }

  if (wallet.balance !== balance) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: balance },
    })
  }

  const updatedTransaction = (await prisma.transaction.update({
    where: { uuid: referenceId },
    data: updateData,
  })) as unknown as Transaction

  try {
    const user = await prisma.user.findUnique({
      where: { id: transaction.user_id },
    })

    await sendTransactionStatusUpdateEmail(
      user,
      updatedTransaction,
      wallet,
      balance,
      updateData.metadata?.note || null,
    )
  } catch (error) {
    console.error(error)
  }

  return updatedTransaction as unknown as Transaction
}

export async function updateUserWalletBalance(
  id: number,
  amount: number,
  fee: number,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'REFUND_WITHDRAWAL',
) {
  const wallet = await prisma.wallet.findFirst({
    where: {
      id,
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
