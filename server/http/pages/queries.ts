import type { Page } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getPages(): Promise<Page[]> {
  return prisma.page.findMany() as unknown as Page[]
}

export async function getPage(id: number): Promise<Page> {
  return (await prisma.page.findUnique({
    where: { id },
  })) as unknown as Page
}
