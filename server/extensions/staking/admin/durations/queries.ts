import type { StakingDuration } from '~~/types'
import prisma from '~~/utils/prisma'

// Get all staking durations
export async function getDurations(): Promise<StakingDuration[]> {
  return prisma.staking_duration.findMany({
    include: {
      pool: true,
    },
  }) as unknown as StakingDuration[]
}

// Get a staking duration
export async function getDuration(id: number): Promise<StakingDuration> {
  return prisma.staking_duration.findUnique({
    where: { id },
    include: {
      pool: true,
    },
  }) as unknown as StakingDuration
}

// Create a new staking duration
export async function createDuration(
  pool_id: number,
  duration: number,
  interest_rate: number,
): Promise<StakingDuration> {
  const existingDuration = await prisma.staking_duration.findFirst({
    where: { pool_id, duration },
  })
  if (existingDuration) {
    throw new Error('Staking duration already exists')
  }
  return prisma.staking_duration.create({
    data: {
      pool_id,
      duration,
      interest_rate,
    },
    include: {
      pool: true,
    },
  }) as unknown as StakingDuration
}

// Update a staking duration
export async function updateDuration(
  id: number,
  duration: number,
  interest_rate: number,
): Promise<StakingDuration> {
  return prisma.staking_duration.update({
    where: { id },
    data: {
      duration,
      interest_rate,
    },
    include: {
      pool: true,
    },
  }) as unknown as StakingDuration
}

// Delete a staking duration
export async function deleteDuration(id: number): Promise<void> {
  await prisma.staking_duration.delete({
    where: { id },
  })
}
