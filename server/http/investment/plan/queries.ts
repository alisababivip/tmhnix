import type { InvestmentPlan } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getPlans(): Promise<InvestmentPlan[]> {
  return (await prisma.investment_plan.findMany({
    where: {
      status: true,
    },
    include: {
      investment: true,
    },
  })) as unknown as InvestmentPlan[]
}

export async function getPlan(id: number): Promise<InvestmentPlan | null> {
  return (await prisma.investment_plan.findUnique({
    where: {
      id: id,
    },
    include: {
      investment: true,
    },
  })) as unknown as InvestmentPlan
}
