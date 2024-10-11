import type { InvestmentPlan } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getPlans(): Promise<InvestmentPlan[]> {
  return (await prisma.investment_plan.findMany({
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

export async function createPlan(
  data: Partial<InvestmentPlan>,
): Promise<InvestmentPlan> {
  return (await prisma.investment_plan.create({
    data: {
      ...(data as any),
      status: true,
    },
  })) as unknown as InvestmentPlan
}

export async function updatePlan(
  id: number,
  data: Partial<InvestmentPlan>,
): Promise<InvestmentPlan> {
  return (await prisma.investment_plan.update({
    where: {
      id: id,
    },
    data: data as any,
  })) as unknown as InvestmentPlan
}

export async function deletePlan(id: number): Promise<void> {
  const deleteInvestmentPlan = prisma.investment_plan.delete({
    where: {
      id: id,
    },
  })

  await prisma.$transaction([deleteInvestmentPlan])
}

export async function deletePlans(ids: number[]): Promise<void> {
  const deleteInvestmentPlan = prisma.investment_plan.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  await prisma.$transaction([deleteInvestmentPlan])
}

export async function updatePlanStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.investment_plan.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      status: status,
    },
  })
}
