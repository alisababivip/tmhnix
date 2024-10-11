import prisma from '~~/utils/prisma'

export async function getTotalStakingPools(): Promise<number> {
  return await prisma.staking_pool.count()
}

export async function getActiveStakingPools(): Promise<number> {
  return await prisma.staking_pool.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getTotalStakes(): Promise<number> {
  return await prisma.staking_log.count()
}

export async function getActiveStakes(): Promise<number> {
  return await prisma.staking_log.count({
    where: {
      status: 'ACTIVE',
    },
  })
}
