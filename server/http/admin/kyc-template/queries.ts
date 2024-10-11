import type { KycTemplate } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getKycTemplates(): Promise<KycTemplate[]> {
  return (await prisma.kyc_template.findMany({
    include: {
      kyc: true,
    },
  })) as unknown as KycTemplate[]
}

export async function getKycTemplate(id: number): Promise<KycTemplate | null> {
  return (await prisma.kyc_template.findUnique({
    where: {
      id: id,
    },
    include: {
      kyc: true,
    },
  })) as unknown as KycTemplate
}

export async function createKycTemplate(data: any): Promise<KycTemplate> {
  return (await prisma.kyc_template.create({
    data: {
      title: data.title,
      options: data.options,
      status: false,
    },
  })) as KycTemplate
}

export async function updateKycTemplate(
  id: number,
  data: any,
): Promise<KycTemplate> {
  return (await prisma.kyc_template.update({
    where: {
      id: id,
    },
    data: {
      title: data.title,
      options: data.options,
    },
  })) as KycTemplate
}

export async function deleteKycTemplate(id: number): Promise<void> {
  await prisma.kyc_template.delete({
    where: {
      id: id,
    },
  })
}

export async function updateKycTemplateStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  await prisma.kyc_template.updateMany({
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
