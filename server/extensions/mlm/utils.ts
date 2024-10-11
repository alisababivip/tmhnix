/* eslint-disable prettier-vue/prettier */
import prisma from '~~/utils/prisma'

export async function listDirectReferrals(user) {
  const referrerUuid = user.uuid

  // Fetch the direct referrals including rewards for the referrer
  const referrals = await prisma.mlm_referral.findMany({
    where: { referrerUuid },
    include: {
      referred: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
          created_at: true,
          status: true,
          _count: {
            select: { referrals: true },
          },
        },
      },
      referrer: {
        include: {
          referral_rewards: true,
        },
      },
    },
  })

  // Map referrals to construct the downlines array
  const downlines = referrals.map((referral) => ({
    uuid: referral.referred.uuid,
    first_name: referral.referred.first_name,
    last_name: referral.referred.last_name,
    avatar: referral.referred.avatar,
    created_at: referral.referred.created_at,
    status: referral.referred.status,
    level: 2,
    rewardsCount: 0, // Set to 0 as rewards are not counted for the referred
    referredCount: referral.referred._count.referrals,
    downlines: [],
  }))

  // Calculate the total rewards count for the referrer
  const rootUserRewardsCount =
    referrals[0]?.referrer?.referral_rewards.length || 0

  return {
    uuid: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    created_at: user.created_at,
    status: user.status,
    level: 1,
    rewardsCount: rootUserRewardsCount,
    referredCount: referrals.length,
    downlines,
  }
}

export async function listUnilevelReferrals(user, mlmSettings) {
  const referrerUuid = user.uuid

  // Fetch the root node for the unilevel tree
  const rootNode = await prisma.mlm_unilevel_node.findFirst({
    where: { referral: { referrerUuid } },
    select: { id: true },
  })

  if (!rootNode) {
    return {
      uuid: user.uuid,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      created_at: user.created_at,
      status: user.status,
      level: 1,
      rewardsCount: 0,
      referredCount: 0,
      downlines: [],
    }
  }

  async function fetchUnilevelDownlines(nodeIds, level = 2) {
    if (level > mlmSettings.unilevel.levels) {
      return []
    }

    const nodes = await prisma.mlm_unilevel_node.findMany({
      where: { id: { in: nodeIds } },
      include: {
        referral: {
          include: {
            referred: {
              select: {
                uuid: true,
                first_name: true,
                last_name: true,
                avatar: true,
                created_at: true,
                status: true,
                referral_rewards: true,
              },
            },
          },
        },
        childs: true,
      },
    })

    const allDownlines = []
    for (const node of nodes) {
      const childNodeIds = node.childs.map((child) => child.id)
      const childDownlines = await fetchUnilevelDownlines(
        childNodeIds,
        level + 1,
      )

      allDownlines.push({
        ...node.referral.referred,
        level,
        rewardsCount: node.referral.referred?.referral_rewards.length || 0,
        referredCount: childDownlines.length,
        downlines: childDownlines,
      })
    }

    return allDownlines
  }

  const topLevelDownlines = await fetchUnilevelDownlines([rootNode.id], 2)

  const rootUserRewardsCount = await prisma.mlm_referral_reward.count({
    where: { referrerUuid },
  })

  return {
    uuid: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    created_at: user.created_at,
    status: user.status,
    level: 1,
    rewardsCount: rootUserRewardsCount,
    referredCount: topLevelDownlines.reduce(
      (acc, line) => acc + line.referredCount,
      0,
    ),
    downlines: topLevelDownlines,
  }
}

export async function listBinaryReferrals(user, mlmSettings) {
  const referrerUuid = user.uuid
  const processedUuids = new Set() // To keep track of processed users

  const rootNodes = await prisma.mlm_binary_node.findMany({
    where: { referral: { referrerUuid } },
    select: { id: true },
  })

  if (!rootNodes.length) {
    return [] // No Binary tree for this user
  }

  async function fetchBinaryDownlines(nodeIds, level = 2) {
    if (level > mlmSettings.binary.levels) {
      return [] // Stop at the maximum level
    }

    const nodes = await prisma.mlm_binary_node.findMany({
      where: { id: { in: nodeIds } },
      include: {
        referral: {
          include: {
            referred: {
              select: {
                uuid: true,
                first_name: true,
                last_name: true,
                avatar: true,
                created_at: true,
                status: true,
                referral_rewards: true,
                referrals: {
                  select: {
                    referredUuid: true,
                  },
                },
              },
            },
          },
        },
        left_child: true,
        right_child: true,
      },
    })

    let referredUuidsToFetch = []
    for (const node of nodes) {
      const referrals = node.referral.referred.referrals
      if (referrals && referrals.length) {
        referredUuidsToFetch.push(...referrals.map((ref) => ref.referredUuid))
      }
    }

    referredUuidsToFetch = [...new Set(referredUuidsToFetch)]

    const referredUsersDetails = await prisma.user.findMany({
      where: { uuid: { in: referredUuidsToFetch } },
      select: {
        uuid: true,
        first_name: true,
        last_name: true,
        avatar: true,
        created_at: true,
        status: true,
        referral_rewards: true,
        referrals: {
          select: {
            referredUuid: true,
          },
        },
      },
    })

    const userDetailsMap = new Map(
      referredUsersDetails.map((user) => [user.uuid, user]),
    )

    const downlines = []

    for (const node of nodes) {
      const { referral } = node
      const referredUuid = referral.referred.uuid

      if (processedUuids.has(referredUuid) || referredUuid === referrerUuid) {
        continue
      }
      processedUuids.add(referredUuid)

      const leftDownline = node.left_child
        ? await fetchBinaryDownlines([node.left_child.id], level + 1)
        : []
      const rightDownline = node.right_child
        ? await fetchBinaryDownlines([node.right_child.id], level + 1)
        : []

      const referredDownlines = referral.referred.referrals.map((ref) => {
        const userDetails = userDetailsMap.get(ref.referredUuid)
        if (userDetails) {
          return {
            ...userDetails,
            level: level + 1,
            rewardsCount: userDetails.referral_rewards.length,
            referredCount: userDetails.referrals.length,
          }
        } else {
          return {
            uuid: ref.referredUuid,
            level: level + 1,
            rewardsCount: 0,
            referredCount: 0,
          }
        }
      })

      downlines.push({
        ...referral.referred,
        level,
        rewardsCount: referral.referred.referral_rewards.length,
        referredCount:
          leftDownline.length + rightDownline.length + referredDownlines.length,
        downlines: [...leftDownline, ...rightDownline, ...referredDownlines],
      })
    }

    return downlines.length > 0 ? downlines : []
  }

  const allDownlines = await fetchBinaryDownlines(
    rootNodes.map((node) => node.id),
    2,
  )

  const rootUserRewardsCount = await prisma.mlm_referral_reward.count({
    where: { referrerUuid },
  })

  return {
    uuid: user.uuid,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: user.avatar,
    created_at: user.created_at,
    status: user.status,
    level: 1,
    rewardsCount: rootUserRewardsCount,
    referredCount: allDownlines.length,
    downlines: allDownlines,
  }
}
