import type { Referral, ReferralStatus } from '~~/types'
import { getMlmSettings } from '~~/utils/affiliate'
import prisma from '~~/utils/prisma'
import {
  listBinaryReferrals,
  listDirectReferrals,
  listUnilevelReferrals,
} from '../../utils'

export async function getAllNodes() {
  return prisma.user
    .findMany({
      where: {
        referrals: {
          some: {
            mlm_binary_node: {
              isNot: null,
            },
          },
        },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        uuid: true,
        avatar: true,
        referrals: {
          where: {
            mlm_binary_node: {
              isNot: null,
            },
          },
          select: {
            id: true,
          },
        },
      },
    })
    .then((users) =>
      users.map((user) => ({
        ...user,
        binaryReferralCount: user.referrals.length,
      })),
    )
}

export async function getNodeById(uuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid },
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

export async function getAllReferrals(): Promise<Referral[]> {
  return prisma.mlm_referral.findMany({
    include: {
      referrer: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
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

export async function getReferralById(id: string): Promise<Referral | null> {
  return prisma.mlm_referral.findUnique({
    where: {
      id: id,
    },
    include: {
      referrer: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
      referred: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  }) as unknown as Referral
}

export async function updateReferralStatus(
  id: string,
  status: ReferralStatus,
): Promise<Referral> {
  return prisma.mlm_referral.update({
    where: {
      id: id,
    },
    data: {
      status: status,
    },
  }) as unknown as Referral
}

export async function getReferralStats(): Promise<any> {
  return prisma.mlm_referral.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  })
}
