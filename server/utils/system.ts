import prisma from './prisma'

export async function storeSystemReport(
  type: string,
  reportContent: string,
  status: boolean,
) {
  const reportData = {
    notes: reportContent,
    status: status,
  }

  return await prisma.system_health.upsert({
    where: { name: type },
    update: reportData,
    create: {
      name: type,
      ...reportData,
    },
  })
}

export async function removeSystemReport(type: string) {
  return await prisma.system_health.delete({
    where: { name: type },
  })
}

export async function updateExtensionQuery(id: string, version: string) {
  return await prisma.extension.update({
    where: {
      product_id: id,
    },
    data: {
      version: version,
    },
  })
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
