import { processRewards } from '~~/utils/affiliate'
import { createLogger } from '../../../logger'
import type { StakingLog, Transaction } from '../../../types'
import {
  sendStakingInitiationEmail,
  sendStakingRewardEmail,
} from '../../../utils/emails'
import { makeUuid } from '../../../utils/passwords'
import prisma from '../../../utils/prisma'
const logger = createLogger('Staking')

// Stake tokens
export async function stakeTokens(
  userId: number,
  poolId: number,
  amount: number,
  durationId: number,
): Promise<StakingLog> {
  const pool = await prisma.staking_pool.findUnique({
    where: { id: poolId },
  })

  if (!pool) throw new Error('Staking pool not found')

  const wallet = await prisma.wallet.findFirst({
    where: {
      user_id: userId,
      currency: pool.currency,
      type: pool.type,
    },
  })

  if (!wallet) throw new Error('Wallet not found')

  const duration = await prisma.staking_duration.findUnique({
    where: { id: durationId },
  })

  if (!duration) throw new Error('Staking duration not found')

  // Calculate new balance and release date
  const balance = wallet.balance - amount
  if (balance < 0) {
    throw new Error('Insufficient balance')
  }
  const releaseDate = new Date()
  releaseDate.setDate(releaseDate.getDate() + duration.duration)

  // Start transaction
  return (await prisma.$transaction(async (prisma) => {
    // Update wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance },
    })

    // Create staking log entry
    const newStake = await prisma.staking_log.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        pool_id: poolId,
        amount,
        stake_date: new Date(),
        release_date: releaseDate,
        status: 'ACTIVE',
      },
    })

    // Calculate reward
    const reward = (amount * duration.duration * duration.interest_rate) / 100

    // Create transaction
    await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        amount,
        description: `Staked ${amount} ${pool.currency} for ${duration.duration} days at ${duration.interest_rate}% interest`,
        status: 'COMPLETED',
        fee: 0,
        type: 'STAKING',
        reference_id: newStake.uuid,
        metadata: {
          pool_id: poolId,
          duration_id: durationId,
          reward: reward.toString(),
        },
      },
    })

    // Send email notification (if applicable)
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        await sendStakingInitiationEmail(
          user,
          newStake,
          pool,
          reward.toString(),
        )
      }
    } catch (error) {
      console.error('Error sending staking initiation email:', error)
    }

    return newStake
  })) as unknown as StakingLog
}

export async function withdrawStake(
  userId: number,
  stakeId: number,
): Promise<StakingLog | null> {
  return prisma.$transaction(async (prisma) => {
    try {
      // Update the staking log status to WITHDRAWN
      const existingStake = await prisma.staking_log.findFirst({
        where: { id: stakeId, user_id: userId },
        include: {
          pool: true,
        },
      })
      if (!existingStake) throw new Error('Stake not found')
      if (existingStake.status === 'WITHDRAWN')
        throw new Error('Stake already collected')

      const stake = (await prisma.staking_log.update({
        where: { id: stakeId, user_id: userId },
        data: {
          status: 'WITHDRAWN',
        },
        include: {
          pool: true,
        },
      })) as unknown as StakingLog

      const transaction = (await prisma.transaction.findFirst({
        where: {
          reference_id: stake.uuid,
        },
      })) as unknown as Transaction

      const reward = parseFloat(transaction?.metadata?.reward || '0')

      const amount = stake.amount + reward

      // Create a transaction record for the withdrawal
      await prisma.transaction.create({
        data: {
          uuid: makeUuid(),
          user_id: userId,
          wallet_id: transaction.wallet_id,
          amount: amount,
          description: `Collected ${amount} ${stake.pool.currency} from staking`,
          status: 'COMPLETED',
          fee: 0,
          type: 'STAKING_REWARD',
          metadata: {
            pool_id: stake.pool_id,
            duration_id: transaction.metadata.duration_id,
          },
        },
      })

      // Retrieve the wallet and calculate the new balance
      const wallet = await prisma.wallet.findUnique({
        where: {
          id: transaction.wallet_id,
        },
      })
      if (!wallet) throw new Error('Wallet not found')

      // Update the wallet balance
      await prisma.wallet.update({
        where: {
          id: transaction.wallet_id,
        },
        data: {
          balance: wallet.balance + amount,
        },
      })

      // Return the updated staking log
      return stake as unknown as StakingLog
    } catch (error) {
      // Handle any errors that occurred during the transaction
      console.error('Error collecting stake:', error)
      throw new Error(`Error collecting stake: ${error.message}`)
    }
  })
}

// List stakes for a user
export async function listUserStakes(userId: number): Promise<StakingLog[]> {
  return prisma.staking_log.findMany({
    where: { user_id: userId },
    include: {
      pool: {
        select: {
          name: true,
          currency: true,
          chain: true,
          type: true,
          durations: true,
        },
      },
    },
  }) as unknown as StakingLog[]
}

// Get a user's staking log by ID
export async function getStakeById(
  userId: number,
  id: number,
): Promise<StakingLog | null> {
  return prisma.staking_log.findUnique({
    where: { id, user_id: userId },
    include: {
      pool: {
        select: {
          durations: true,
        },
      },
    },
  }) as unknown as StakingLog
}

export async function processStakingLogs() {
  // Get all staking logs where release_date has passed and status is ACTIVE
  const stakingLogsToRelease = (await prisma.staking_log.findMany({
    where: {
      release_date: {
        lt: new Date(),
      },
      status: 'ACTIVE',
    },
    include: {
      pool: {
        select: {
          name: true,
          currency: true,
          chain: true,
          type: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  })) as any

  for (const log of stakingLogsToRelease) {
    try {
      await releaseStake(log.id)
      await sendStakingRewardEmail(
        log.user,
        log,
        log.pool,
        log.transaction.metadata.reward,
      )

      await processRewards(
        log.user.uuid,
        log.amount,
        'STAKING_LOYALTY',
        log.pool.currency,
      )
    } catch (error) {
      logger.error(`Failed to release stake for log ${log.id}:`, error)
    }
  }
}

export async function releaseStake(stakeId: number) {
  return prisma.staking_log.update({
    where: { id: stakeId },
    data: { status: 'RELEASED' },
  })
}
