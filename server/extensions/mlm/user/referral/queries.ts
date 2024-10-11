import { type Referral } from '~~/types'
import { getMlmSettings } from '~~/utils/affiliate'
import { convertAndSortCounts } from '~~/utils/analytics'
import prisma from '~~/utils/prisma'
import {
  listBinaryReferrals,
  listDirectReferrals,
  listUnilevelReferrals,
} from '../../utils'

export async function listMyReferrals(userId: number): Promise<Referral[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return prisma.mlm_referral.findMany({
    where: {
      referrerUuid: user.uuid,
    },
    include: {
      referred: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  }) as unknown as Referral[]
}

export async function getAnalyticsPerDay(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const referrerUuid = user.uuid
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  // Concurrently fetch rewards and referrals
  const [rewards, referrals] = await Promise.all([
    prisma.mlm_referral_reward.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
        referrerUuid: referrerUuid,
      },
    }),
    prisma.mlm_referral.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
        referrerUuid: referrerUuid,
      },
    }),
  ])

  // Initialize the counts object
  const counts = {
    referrals: {},
    activeReferrals: {},
    claimedRewards: {},
    totalRewards: {},
  }

  referrals.forEach((referral) => {
    const referralDate = referral.created_at.toISOString().split('T')[0]
    counts.referrals[referralDate] = (counts.referrals[referralDate] || 0) + 1

    if (referral.status === 'ACTIVE') {
      counts.activeReferrals[referralDate] =
        (counts.activeReferrals[referralDate] || 0) + 1
    }
  })

  rewards.forEach((reward) => {
    const rewardDate = reward.created_at.toISOString().split('T')[0]
    counts.totalRewards[rewardDate] = (counts.totalRewards[rewardDate] || 0) + 1

    if (reward.is_claimed) {
      counts.claimedRewards[rewardDate] =
        (counts.claimedRewards[rewardDate] || 0) + 1
    }
  })

  // Convert counts to arrays and sort by date
  const result = {
    referrals: convertAndSortCounts(counts.referrals),
    activeReferrals: convertAndSortCounts(counts.activeReferrals),
    claimedRewards: convertAndSortCounts(counts.claimedRewards),
    totalRewards: convertAndSortCounts(counts.totalRewards),
  }

  return result
}

export async function listReferrals(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const settings = await getMlmSettings()
  const mlmSettings = JSON.parse(settings['mlm_settings'])

  switch (settings['mlm_system']) {
    case 'DIRECT':
      return listDirectReferrals(user)
    case 'BINARY':
      return listBinaryReferrals(user, mlmSettings)
    case 'UNILEVEL':
      return listUnilevelReferrals(user, mlmSettings)
    default:
      return listDirectReferrals(user)
  }
}
