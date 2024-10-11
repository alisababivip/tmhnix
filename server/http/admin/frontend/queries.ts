import prisma from '~~/utils/prisma'
import { createError } from '~~/utils'

export async function getFrontendSections() {
  return await prisma.frontend.findMany()
}

export async function getFrontendSection(id: number) {
  return await prisma.frontend.findUnique({
    where: { id },
  })
}

export async function updateFrontendSection(id: number, section: any) {
  return await prisma.frontend.update({
    where: { id },
    data: {
      content: section,
    },
  })
}
export async function updateFrontendSectionStatus(
  ids: number[],
  status: boolean,
): Promise<void> {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    console.log('Missing ids')
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing ids',
    })
  }

  // Update each frontend status
  try {
    await prisma.frontend.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: status as any,
      },
    })
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
}
