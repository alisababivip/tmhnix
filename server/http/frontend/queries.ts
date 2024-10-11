import prisma from '~~/utils/prisma'

export async function getFrontendSections() {
  return await prisma.frontend.findMany({
    where: {
      status: true,
    },
  })
}
