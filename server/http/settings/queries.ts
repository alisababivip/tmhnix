import type { Extension } from '~~/types'
import prisma from '../../utils/prisma'

interface PartialSettings {
  key: string
  value: string
}
export async function getSettings(): Promise<PartialSettings[]> {
  return await prisma.settings.findMany({
    select: {
      key: true,
      value: true,
    },
  })
}

export async function getExtensionsQuery(): Promise<Extension[]> {
  return (await prisma.extension.findMany({
    where: {
      status: true,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  })) as unknown as Extension[]
}
