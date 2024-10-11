import type { StakingPool, StakingStatus } from '~~/types'
import prisma from '~~/utils/prisma'

// List all staking pools
export async function listPools(): Promise<StakingPool[]> {
  return prisma.staking_pool.findMany() as unknown as StakingPool[]
}

// Get pool details by ID
export async function getPoolById(id: number): Promise<StakingPool | null> {
  return prisma.staking_pool.findUnique({
    where: { id },
  }) as unknown as StakingPool
}

// Create a new staking pool
export async function createPool(
  name: string,
  currency: string,
  chain: string,
  type: 'SPOT' | 'ECO',
  min_stake: number,
  max_stake: number,
  status: StakingStatus,
  description: string,
): Promise<StakingPool> {
  return prisma.staking_pool.create({
    data: {
      name,
      currency,
      chain,
      type,
      min_stake,
      max_stake,
      status,
      description,
    },
  }) as unknown as StakingPool
}

// Update a staking pool
export async function updatePool(
  id: number,
  name: string,
  currency: string,
  chain: string,
  type: 'SPOT' | 'ECO',
  min_stake: number,
  max_stake: number,
  status: StakingStatus,
  description: string,
): Promise<StakingPool> {
  return prisma.staking_pool.update({
    where: { id },
    data: {
      name,
      currency,
      chain,
      type,
      min_stake,
      max_stake,
      status,
      description,
    },
  }) as unknown as StakingPool
}

// Delete a staking pool
export async function deletePool(id: number): Promise<void> {
  await prisma.staking_pool.delete({
    where: { id },
  })
}
