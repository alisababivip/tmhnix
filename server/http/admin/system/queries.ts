import type { Extension } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getExtensionsQuery(): Promise<Extension[]> {
  return (await prisma.extension.findMany()) as unknown as Extension[]
}

export async function updateExtensionStatusQuery(
  id: string,
  status: boolean,
): Promise<Extension> {
  return (await prisma.extension.update({
    where: {
      product_id: id,
    },
    data: {
      status: status,
    },
  })) as unknown as Extension
}
