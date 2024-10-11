import type { Kyc, KycStatus } from '~~/types'
import { sendKycEmail } from '~~/utils/emails'

import prisma from '~~/utils/prisma'

export async function getKycs(): Promise<Kyc[]> {
  return (await prisma.kyc.findMany({
    include: {
      template: true,
      user: true,
    },
  })) as unknown as Kyc[]
}

export async function getKyc(id: number): Promise<Kyc | null> {
  return (await prisma.kyc.findUnique({
    where: {
      id: id,
    },
    include: {
      template: true,
      user: true,
    },
  })) as unknown as Kyc
}

export async function deleteKyc(id: number): Promise<void> {
  if (!id) {
    throw new Error('Missing id')
  }
  await prisma.kyc.delete({
    where: {
      id: id,
    },
  })
}

export async function updateKycStatus(
  id: number,
  status: KycStatus,
  message?: string,
): Promise<Kyc> {
  const kyc = await prisma.kyc.update({
    where: {
      id: id,
    },
    data: {
      status: status,
      notes: message,
    },
    include: {
      user: true,
    },
  })

  const user = await prisma.user.findUnique({
    where: {
      id: kyc.user_id,
    },
  })

  let emailType: 'KycApproved' | 'KycRejected'

  switch (status) {
    case 'APPROVED':
      emailType = 'KycApproved'
      break
    case 'REJECTED':
      emailType = 'KycRejected'
      break
    default:
      throw new Error(`Unknown status: ${status}`)
  }

  await sendKycEmail(user, kyc, emailType)

  return kyc as unknown as Kyc
}
