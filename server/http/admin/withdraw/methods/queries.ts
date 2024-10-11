import type { WithdrawMethod } from '~~/types'

import prisma from '~~/utils/prisma'

export async function createWithdrawMethod(
  withdrawMethodData: WithdrawMethod,
): Promise<WithdrawMethod> {
  return (await prisma.withdraw_method.create({
    data: withdrawMethodData as any,
  })) as unknown as WithdrawMethod
}

export async function updateWithdrawMethod(
  id: number,
  withdrawMethodData: WithdrawMethod,
): Promise<WithdrawMethod> {
  return (await prisma.withdraw_method.update({
    where: { id },
    data: withdrawMethodData as any,
  })) as unknown as WithdrawMethod
}

export async function updateWithdrawMethodStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.withdraw_method.updateMany({
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

export async function deleteWithdrawMethod(id: number): Promise<void> {
  await prisma.withdraw_method.delete({ where: { id } })
}
