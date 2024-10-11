import prisma from '~~/utils/prisma'

// Total number of referrals
export async function getTotalReferrals(): Promise<number> {
  return prisma.mlm_referral.count()
}

// Number of active referrals
export async function getActiveReferrals(): Promise<number> {
  return prisma.mlm_referral.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

// Number of rewards given
export async function getTotalRewards(): Promise<number> {
  return prisma.mlm_referral_reward.count()
}

// Sum of all rewards
export async function getClaimedRewards(): Promise<number> {
  return prisma.mlm_referral_reward.count({
    where: {
      is_claimed: true,
    },
  })
}
