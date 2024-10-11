// userWalletQueries.ts
import type { Transaction, Wallet, WalletData } from '../../../../types'
import { makeUuid } from '../../../../utils/passwords'
import prisma from '../../../../utils/prisma'

const walletInclude = {
  transactions: true,
}

// Fetch all user wallets by user ID
export async function getWallets(
  userId: number,
  transactions: boolean,
  addresses: boolean,
): Promise<Wallet[]> {
  return (await prisma.wallet.findMany({
    where: {
      user_id: userId,
      type: 'ECO',
    },
    select: {
      uuid: true,
      type: true,
      currency: true,
      balance: true,
      addresses: addresses,
      transactions: transactions
        ? {
            select: {
              uuid: true,
              type: true,
              status: true,
              amount: true,
              fee: true,
              description: true,
              metadata: true,
              reference_id: true,
              created_at: true,
            },
          }
        : undefined,
    },
  })) as unknown as Wallet[]
}

// Fetch a single user wallet by ID
export async function getWallet(
  userId: number,
  currency: string,
): Promise<Wallet> {
  return (await prisma.wallet.findUnique({
    where: {
      wallet_user_id_currency_type_unique: {
        user_id: userId,
        currency: currency,
        type: 'ECO',
      },
    },
    include: walletInclude,
  })) as unknown as Wallet
}

// Fetch a single user wallet by ID
export async function getWalletOnly(
  userId: number,
  currency: string,
): Promise<Wallet> {
  return (await prisma.wallet.findUnique({
    where: {
      wallet_user_id_currency_type_unique: {
        user_id: userId,
        currency: currency,
        type: 'ECO',
      },
    },
  })) as unknown as Wallet
}

// Fetch a single user wallet by UUID
export async function getWalletByUuid(uuid: string): Promise<Wallet> {
  return (await prisma.wallet.findUnique({
    where: {
      uuid,
    },
    include: walletInclude,
  })) as unknown as Wallet
}

// Create a new user wallet
export async function createWallet(userId: number, data: any): Promise<Wallet> {
  return (await prisma.wallet.create({
    data: {
      ...data,
      user_id: userId,
      type: 'ECO',
    },
  })) as unknown as Wallet
}

export async function getWalletData(
  walletId: number,
  chain: string,
): Promise<WalletData> {
  return (await prisma.wallet_data.findFirst({
    where: {
      wallet_id: walletId,
      chain,
    },
  })) as unknown as WalletData
}

// Find an alternative wallet with sufficient funds
export async function findAlternativeWallet(walletData, amount) {
  const alternativeWalletData = await prisma.wallet_data.findFirst({
    where: {
      currency: walletData.currency,
      chain: walletData.chain,
      balance: {
        gte: amount,
      },
    },
  })

  if (!alternativeWalletData) {
    throw new Error('No alternative wallet with sufficient balance found')
  }

  return alternativeWalletData
}

export async function getPendingTransactions() {
  const pendingTransactions = (await prisma.transaction.findMany({
    where: {
      type: 'WITHDRAW',
      status: 'PENDING',
      wallet: {
        type: 'ECO',
      },
    },
  })) as unknown as Transaction[]

  return pendingTransactions
}

export const handleDeposit = async (trx: any): Promise<boolean> => {
  const {
    uuid,
    from,
    amount,
    chain,
    hash,
    status,
    gasLimit,
    gasPrice,
    gasUsed,
  } = trx

  const transaction = await prisma.transaction.findUnique({
    where: {
      reference_id: hash,
    },
  })
  if (transaction) {
    throw new Error('Transaction already processed')
  }
  const wallet = await prisma.wallet.findUnique({
    where: {
      uuid,
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const addresses = wallet.addresses
  const address = addresses[chain]
  if (!address) {
    throw new Error('Address not found')
  }
  address.balance += parseFloat(amount)

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: {
        increment: parseFloat(amount), // Convert to float
      },
      addresses,
    },
  })

  await prisma.transaction.create({
    data: {
      uuid: makeUuid(),
      user_id: wallet.user_id,
      wallet_id: wallet.id,
      type: 'DEPOSIT',
      status,
      amount: parseFloat(amount),
      description: `Deposit of ${amount} ${wallet.currency} from ${from}`,
      reference_id: hash,
      fee: parseFloat(gasUsed) * parseFloat(gasPrice),
      metadata: {
        chain,
        currency: wallet.currency,
        gasLimit,
        gasPrice,
        gasUsed,
      },
    },
  })

  return true
}

export async function updatePrivateLedger(
  wallet_id: number,
  index: number,
  currency: string,
  chain: string,
  difference: number,
) {
  const networkEnvVar = `${chain}_NETWORK`
  const networkValue = process.env[networkEnvVar]

  return await prisma.ecosystem_private_ledger.upsert({
    where: {
      private_ledger_unique: {
        wallet_id,
        index,
        currency,
        chain,
        network: networkValue,
      },
    },
    update: {
      offchain_difference: {
        increment: difference,
      },
    },
    create: {
      wallet_id,
      index,
      currency,
      chain,
      offchain_difference: difference,
      network: networkValue,
    },
  })
}

export const decrementWalletBalance = async (userWallet, chain, amount) => {
  const addresses = userWallet.addresses
  let balance = userWallet.balance - amount
  if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(chain)) {
    balance = Number(balance.toFixed(8))
  }
  addresses[chain].balance -= amount

  await prisma.wallet.update({
    where: { id: userWallet.id },
    data: {
      balance,
      addresses,
    },
  })
}

// Create a pending transaction entry in the database
export async function createPendingTransaction(
  userId,
  walletId,
  currency,
  chain,
  amount,
  toAddress,
  withdrawalFee,
) {
  return await prisma.transaction.create({
    data: {
      uuid: makeUuid(),
      user_id: userId,
      wallet_id: walletId,
      type: 'WITHDRAW',
      status: 'PENDING',
      amount,
      fee: withdrawalFee,
      description: `Pending withdrawal of ${amount} ${currency} to ${toAddress}`,
      metadata: {
        toAddress,
        chain,
      },
    },
  })
}

export const refundUser = async (transaction) => {
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: 'FAILED',
      description: `Refund of ${transaction.amount}`,
    },
  })

  const wallet = await prisma.wallet.findUnique({
    where: { id: transaction.wallet_id },
  })
  const addresses = wallet.addresses
  addresses[transaction.metadata?.chain].balance +=
    transaction.amount + transaction.fee

  await prisma.wallet.update({
    where: { id: transaction.wallet_id },
    data: {
      balance: {
        increment: transaction.amount + transaction.fee,
      },
      addresses,
    },
  })
}

export const updateAlternativeWallet = async (currency, chain, amount) => {
  const alternativeWalletData = await prisma.wallet_data.findFirst({
    where: {
      currency: currency,
      chain: chain,
    },
  })

  await prisma.wallet_data.update({
    where: { id: alternativeWalletData.id },
    data: {
      balance: {
        decrement: amount,
      },
    },
  })

  await updatePrivateLedger(
    alternativeWalletData.wallet_id,
    alternativeWalletData.index,
    currency,
    chain,
    amount,
  )
}
