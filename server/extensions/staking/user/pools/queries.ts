import type { StakingDuration, StakingPool } from '~~/types'
import prisma from '~~/utils/prisma'

// List all active staking pools
export async function listActivePools(): Promise<StakingPool[]> {
  return prisma.staking_pool.findMany({
    where: { status: 'ACTIVE' },
    include: {
      durations: true, // Include the staking durations related to the pool
    },
  }) as unknown as StakingPool[]
}

// Get details of a specific staking pool by ID
export async function getPoolDetailsById(
  id: number,
): Promise<StakingPool | null> {
  return prisma.staking_pool.findUnique({
    where: { id },
    include: {
      durations: true, // Include the staking durations related to the pool
    },
  }) as unknown as StakingPool
}

// Get staking durations for a specific pool
export async function getDurationsByPoolId(
  poolId: number,
): Promise<StakingDuration[]> {
  return prisma.staking_duration.findMany({
    where: { pool_id: poolId },
  }) as unknown as StakingDuration[]
}
