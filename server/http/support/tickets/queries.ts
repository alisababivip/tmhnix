import type { SupportTicket } from '~~/types'
import { makeUuid } from '~~/utils/passwords'

import prisma from '~~/utils/prisma'

// Get all tickets for a user
export async function getTickets(userId: number): Promise<SupportTicket[]> {
  return (await prisma.support_ticket.findMany({
    where: { user_id: userId },
    include: {
      chat: {
        select: {
          agent: {
            select: {
              avatar: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  })) as unknown as SupportTicket[]
}

// Get a specific ticket
export async function getTicket(
  userId: number,
  ticketId: number,
): Promise<SupportTicket | null> {
  return (await prisma.support_ticket.findUnique({
    where: { id: ticketId, user_id: userId },
    include: {
      chat: {
        include: {
          user: {
            select: {
              id: true,
              uuid: true,
              avatar: true,
              first_name: true,
              last_name: true,
              last_login: true,
              is_active: true,
            },
          },
        },
      },
    },
  })) as unknown as SupportTicket
}

// Create a new ticket
export async function createTicket(
  userId: number,
  ticket: SupportTicket,
): Promise<SupportTicket> {
  const chat = await prisma.support_chat.create({
    data: {
      uuid: makeUuid(),
      user_id: userId,
      messages: [
        {
          type: 'client',
          text: ticket.message,
          time: new Date(),
          user_id: userId,
          attachments: [],
        },
      ],
    },
  })

  if (!chat) throw new Error('Failed to create chat')

  return (await prisma.support_ticket.create({
    data: {
      uuid: makeUuid(),
      user_id: userId,
      subject: ticket.subject,
      message: ticket.message,
      importance: ticket.importance,
      status: 'PENDING',
      chat_id: chat.id,
    },
  })) as unknown as SupportTicket
}

// Close a ticket
export async function closeTicket(ticketId: string): Promise<SupportTicket> {
  return (await prisma.support_ticket.update({
    where: { uuid: ticketId },
    data: {
      status: 'CLOSED',
    },
  })) as unknown as SupportTicket
}
