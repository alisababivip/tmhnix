import type { ReferralReward } from '~~/types'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'

export async function listMyRewards(userId): Promise<ReferralReward[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }
  return (await prisma.mlm_referral_reward.findMany({
    where: {
      referrerUuid: user.uuid,
    },
    include: {
      condition: true,
    },
  })) as unknown as ReferralReward[]
}

export async function claimReward(userId, rewardId) {
  const reward = await prisma.mlm_referral_reward.findUnique({
    where: {
      id: rewardId,
    },
    include: {
      condition: true,
    },
  })

  if (reward && reward.is_claimed) {
    throw new Error('Reward already claimed')
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      wallet_user_id_currency_type_unique: {
        user_id: userId,
        currency: reward.condition.reward_currency,
        type: reward.condition.reward_wallet_type,
      },
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  const balance = wallet.balance + reward.reward

  const updatedReward = await prisma.$transaction([
    prisma.mlm_referral_reward.update({
      where: {
        id: reward.id,
      },
      data: {
        is_claimed: true,
      },
    }),
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
        user_id: userId,
        wallet_id: wallet.id,
        type: 'REFERRAL_REWARD',
        status: 'COMPLETED',
        amount: reward.reward,
        description: `Reward for ${reward.condition.type}`,
        metadata: {
          reward_id: reward.id,
        },
      },
    }),
  ])

  return updatedReward[0]
}
