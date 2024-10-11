import type { StakingLog } from '~~/types'
import prisma from '~~/utils/prisma'

// List all staking logs
export async function listLogs(): Promise<StakingLog[]> {
  return prisma.staking_log.findMany({
    include: {
      pool: {
        select: {
          name: true,
          currency: true,
          chain: true,
          type: true,
          durations: true,
        },
      },
    },
  }) as unknown as StakingLog[]
}

// Get staking log details by ID
export async function getLogById(id: number): Promise<StakingLog | null> {
  return prisma.staking_log.findUnique({
    where: { id },
    include: {
      pool: {
        select: {
          name: true,
          currency: true,
          chain: true,
          type: true,
          durations: true,
        },
      },
    },
  }) as unknown as StakingLog
}
