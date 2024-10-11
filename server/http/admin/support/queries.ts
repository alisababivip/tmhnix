import type { SupportTicket } from '~~/types' // Assuming 'SupportTicket' is defined in '~~/lib/types'

import prisma from '~~/utils/prisma'

// Get all tickets for admin
export async function listTickets(): Promise<SupportTicket[]> {
  return (await prisma.support_ticket.findMany({
    include: {
      chat: {
        select: {
          id: true,
          uuid: true,
          user_id: true,
          agent_id: true,
        },
      },
      user: {
        select: {
          id: true,
          uuid: true,
          avatar: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  })) as unknown as SupportTicket[]
}

// Get a specific ticket for admin
export async function getTicket(
  ticketId: string,
): Promise<SupportTicket | null> {
  return (await prisma.support_ticket.findUnique({
    where: { uuid: ticketId },
  })) as unknown as SupportTicket
}

// Admin reopen a ticket
export async function openTicket(ticketId: string): Promise<SupportTicket> {
  return (await prisma.support_ticket.update({
    where: { uuid: ticketId },
    data: {
      status: 'OPEN',
    },
  })) as unknown as SupportTicket
}

// Admin assign a ticket to himself
export async function assignTicket(
  agentId: number,
  ticketId: string,
): Promise<any> {
  const ticket = await prisma.support_ticket.findUnique({
    where: { uuid: ticketId },
  })

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const chat = await prisma.support_chat.findUnique({
    where: { id: ticket.chat_id },
  })

  if (!chat) {
    throw new Error('Chat not found')
  }

  return await prisma.support_chat.update({
    where: { id: chat.id },
    data: {
      agent_id: agentId,
    },
  })
}

// Admin delete a ticket
export async function deleteTicket(ticketId: string): Promise<any> {
  const ticket = await prisma.support_ticket.findUnique({
    where: { uuid: ticketId },
  })

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const chat = await prisma.support_chat.findUnique({
    where: { id: ticket.chat_id },
  })

  if (!chat) {
    throw new Error('Chat not found')
  }

  return await prisma.support_chat.delete({
    where: { id: chat.id },
  })
}
