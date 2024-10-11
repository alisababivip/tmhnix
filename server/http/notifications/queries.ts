import type { Notification } from '~~/types'

import prisma from '~~/utils/prisma'

// Get all notifications for a specific user
export async function getNotifications(
  userId: number,
): Promise<Notification[]> {
  return (await prisma.notification.findMany({
    where: { user_id: userId },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  })) as unknown as Notification[]
}

// Create a new notification
export async function createNotification(
  userId: number,
  data: any,
): Promise<Notification> {
  return (await prisma.notification.create({
    data: {
      ...data,
      user_id: userId,
    },
  })) as unknown as Notification
}

// Delete a notification
export async function deleteNotification(
  userId: number,
  id: number,
): Promise<void> {
  await prisma.notification.delete({
    where: { user_id: userId, id },
  })
}
