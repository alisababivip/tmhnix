import prisma from '~~/utils/prisma'

export async function listAllRewards() {
  return prisma.mlm_referral_reward.findMany({
    include: {
      condition: true,
      referrer: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  })
}

export async function showReward(id) {
  return prisma.mlm_referral_reward.findUnique({
    where: { id },
    include: {
      condition: true,
      referrer: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  })
}

export async function deleteRewardCondition(id) {
  return prisma.mlm_referral_reward.delete({
    where: { id },
  })
}
