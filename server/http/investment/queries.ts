import { createLogger } from '~~/logger'
import { processRewards } from '~~/utils/affiliate'
import type { Investment, User } from '../../types'
import { sendInvestmentEmail } from '../../utils/emails'
import { makeUuid } from '../../utils/passwords'
import prisma from '../../utils/prisma'
const logger = createLogger('User Investment')

// Constants for repeated query clauses
const userSelect = {
  first_name: true,
  last_name: true,
  uuid: true,
  avatar: true,
}

const investmentInclude = {
  plan: true,
  user: { select: userSelect },
}

// Constants for Error Messages
const INVESTMENT_NOT_FOUND = 'Investment not found'
const WALLET_NOT_FOUND = 'Wallet not found'

async function findWallet(userId: number, currency: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { user_id: userId, currency },
  })
  if (!wallet) throw new Error(WALLET_NOT_FOUND)
  return wallet
}

async function findInvestmentByUuid(uuid: string) {
  const investment = await prisma.investment.findUnique({
    where: { uuid },
    include: {
      plan: true,
      wallet: true,
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
    },
  })
  if (!investment) throw new Error(INVESTMENT_NOT_FOUND)
  return investment
}

export async function getInvestments(): Promise<Investment[]> {
  return (await prisma.investment.findMany({
    include: investmentInclude,
  })) as unknown as Investment[]
}

export async function getInvestment(uuid: string): Promise<Investment | null> {
  return (await prisma.investment.findUnique({
    where: { uuid },
    include: investmentInclude,
  })) as unknown as any
}

export async function getUserInvestment(
  userId: number,
): Promise<Investment | null> {
  return (await prisma.investment.findFirst({
    where: {
      user_id: userId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
    },
  })) as unknown as Investment
}

export async function createInvestment(
  userId: number,
  planId: number,
  amount: number,
): Promise<Investment> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User

  if (!user) {
    throw new Error('User not found')
  }

  const existingInvestment = await prisma.investment.findFirst({
    where: {
      user_id: user.id,
      status: 'ACTIVE',
    },
  })

  if (existingInvestment) {
    if (existingInvestment.plan_id !== planId) {
      try {
        await cancelInvestment(userId, existingInvestment.uuid)
      } catch (error) {
        throw new Error('Failed to cancel existing investment')
      }
    } else {
      throw new Error('You already have an active investment in this plan')
    }
  }

  const investmentPlan = await prisma.investment_plan.findUnique({
    where: { id: planId },
  })

  if (!investmentPlan) {
    throw new Error('Investment plan not found')
  }

  const wallet = await findWallet(user.id, investmentPlan.currency)

  const balance = wallet.balance - amount

  if (balance < 0) {
    throw new Error('Insufficient balance')
  }

  const walletUpdate = prisma.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      balance: balance,
    },
  })

  const investmentCreate = prisma.investment.create({
    data: {
      uuid: makeUuid(),
      user_id: user.id,
      plan_id: investmentPlan.id,
      wallet_id: wallet.id,
      amount: amount,
      roi: investmentPlan.roi,
      duration: investmentPlan.duration,
      status: 'ACTIVE',
    },
  })

  // First, update wallet and create investment
  const [updatedWallet, newInvestment] = await prisma.$transaction([
    walletUpdate,
    investmentCreate,
  ])

  // Now, create transaction with reference_id set to new investment's ID
  const transactionCreate = prisma.transaction.create({
    data: {
      uuid: makeUuid(),
      user_id: user.id,
      wallet_id: wallet.id,
      amount: amount,
      description: `Investment in ${investmentPlan.name} plan for ${investmentPlan.duration} days`,
      status: 'COMPLETED',
      fee: 0,
      type: 'INVESTMENT',
      reference_id: newInvestment.uuid, // Use the ID of the newly created investment
    },
  })

  await prisma.$transaction([transactionCreate])

  const investment = await prisma.investment.findFirst({
    where: {
      user_id: user.id,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
    },
  })

  await sendInvestmentEmail(user, investment, 'NewInvestmentCreated')
  return investment as unknown as Investment
}

export async function cancelInvestment(
  userId: number,
  investmentUuid: string,
): Promise<void> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User

  if (!user) {
    throw new Error('User not found')
  }
  const investment = await findInvestmentByUuid(investmentUuid)
  const wallet = await findWallet(user.id, investment.plan.currency)

  // Check if the transaction exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: { reference_id: investment.uuid },
  })

  await prisma.$transaction(async (prisma) => {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + investment.amount },
    })

    await prisma.investment.delete({
      where: { id: investment.id },
    })

    if (existingTransaction) {
      await prisma.transaction.delete({
        where: { reference_id: investment.uuid },
      })
    }
  })

  await sendInvestmentEmail(user, investment, 'InvestmentCanceled')
}

export async function updateInvestment(
  id: number,
  data: any,
): Promise<Investment> {
  const updatedInvestment = await prisma.investment.update({
    where: {
      id: id,
    },
    data: data.investment,
  })

  // Fetch the user associated with the updated investment
  const user = (await prisma.user.findUnique({
    where: {
      id: updatedInvestment.user_id,
    },
  })) as unknown as User

  // Now, you have the user and can send the email
  await sendInvestmentEmail(user, updatedInvestment, 'InvestmentUpdated')

  return updatedInvestment as unknown as Investment
}

export async function deleteInvestment(id: number): Promise<void> {
  const deleteInvestment = prisma.investment.delete({
    where: {
      id: id,
    },
  })

  await prisma.$transaction([deleteInvestment])
}

export async function deleteInvestments(ids: number[]): Promise<void> {
  const deleteInvestment = prisma.investment.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  await prisma.$transaction([deleteInvestment])
}

export async function checkInvestments(): Promise<void> {
  const investments = await prisma.investment.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  })

  for (const investment of investments) {
    const endDate = new Date(
      investment.created_at.getTime() +
        investment.duration * 24 * 60 * 60 * 1000,
    )
    const currentDate = new Date()

    if (currentDate.getTime() < endDate.getTime()) {
      continue
    }

    const wallet = await prisma.wallet.findFirst({
      where: {
        id: investment.wallet_id,
      },
    })

    if (!wallet) {
      throw new Error('Wallet not found')
    }
    const roi = investment.amount + investment.amount * (investment.roi / 100)
    const balance = wallet.balance + roi

    await prisma.$transaction([
      prisma.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: balance,
        },
      }),
      prisma.transaction.create({
        data: {
          uuid: makeUuid(),
          user_id: investment.user_id,
          wallet_id: wallet.id,
          amount: roi,
          reference_id: makeUuid(),
          description: `Investment ROI: Plan "${investment.plan.title}" | Duration: ${investment.plan.duration} days`,
          status: 'COMPLETED',
          fee: 0,
          type: 'INVESTMENT_ROI',
        },
      }),
      prisma.investment.update({
        where: {
          id: investment.id,
        },
        data: {
          status: 'COMPLETED',
        },
      }),
    ])
    const user = (await prisma.user.findUnique({
      where: {
        id: investment.user_id,
      },
    })) as unknown as User

    try {
      await processRewards(
        user.uuid,
        investment.amount,
        'INVESTMENT',
        wallet?.currency,
      )
    } catch (error) {
      logger.error(`Error processing rewards: ${error.message}`)
    }
  }
}
