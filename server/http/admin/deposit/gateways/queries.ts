import type { DepositGateway } from '~~/types'

import prisma from '~~/utils/prisma'

export async function updateDepositGateway(
  id: number,
  depositGatewayData: DepositGateway,
): Promise<DepositGateway> {
  return prisma.deposit_gateway.update({
    where: { id },
    data: depositGatewayData,
  }) as unknown as DepositGateway
}

export async function updateDepositGatewayStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.deposit_gateway.updateMany({
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
