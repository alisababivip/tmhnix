import type { KycTemplate } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getActiveKycTemplate(): Promise<KycTemplate> {
  return (await prisma.kyc_template.findFirst({
    where: {
      status: true,
    },
  })) as unknown as KycTemplate
}
