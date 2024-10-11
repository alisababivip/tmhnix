import type { NotificationTemplate } from '~~/types'
import { createError } from '~~/utils'

import prisma from '~~/utils/prisma'

export async function getTemplatesQuery(): Promise<NotificationTemplate[]> {
  return (await prisma.notification_templates.findMany()) as unknown as NotificationTemplate[]
}

export async function getTemplateQuery(
  id: number,
): Promise<NotificationTemplate> {
  return (await prisma.notification_templates.findUnique({
    where: {
      id,
    },
  })) as unknown as NotificationTemplate
}

export async function updateTemplateQuery(
  id?: number,
  data?: any,
): Promise<NotificationTemplate | Error> {
  if (id === undefined || id === null) {
    throw createError({
      statusCode: 400,
      statusMessage: "The 'id' parameter is missing.",
    })
  }

  if (!data || Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "The 'data' parameter is missing.",
    })
  }

  return (await prisma.notification_templates.update({
    where: { id },
    data,
  })) as unknown as NotificationTemplate
}
