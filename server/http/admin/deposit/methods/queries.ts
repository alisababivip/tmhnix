import type { DepositMethod } from '~~/types'
import prisma from '~~/utils/prisma'

export async function createDepositMethod(
  depositMethodData: Omit<DepositMethod, 'id'>,
): Promise<DepositMethod> {
  return (await prisma.deposit_method.create({
    data: depositMethodData as unknown as any,
  })) as unknown as DepositMethod
}

export async function updateDepositMethod(
  id: number,
  depositMethodData: Partial<DepositMethod>,
): Promise<DepositMethod> {
  return (await prisma.deposit_method.update({
    where: { id },
    data: depositMethodData as unknown as any,
  })) as unknown as DepositMethod
}

export async function updateDepositMethodStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.deposit_method.updateMany({
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

export async function deleteDepositMethod(id: number): Promise<void> {
  await prisma.deposit_method.delete({ where: { id } })
}
