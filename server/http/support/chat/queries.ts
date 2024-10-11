import type { Chat, Message } from '~~/types'
import { createError } from '~~/utils'
import { sendChatEmail } from '~~/utils/emails'

import prisma from '~~/utils/prisma'

// get messages of a conversation
export async function getMessages(ticketId: string): Promise<Chat> {
  const ticket = await prisma.support_ticket.findUnique({
    where: { uuid: ticketId },
  })

  if (!ticket)
    throw createError({
      statusMessage: 'Ticket not found',
      statusCode: 404,
    })

  return (await prisma.support_chat.findUnique({
    where: { id: ticket.chat_id },
  })) as unknown as Chat
}

export async function sendMessage(
  userId: number,
  ticketId: string,
  message: Message,
  isSupport?: boolean,
): Promise<Chat> {
  // Fetch user and ticket in parallel
  const [user, ticket] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.support_ticket.findUnique({ where: { uuid: ticketId } }),
  ])

  if (!user)
    throw createError({
      statusMessage: 'User not found',
      statusCode: 404,
    })
  if (!ticket)
    throw createError({
      statusMessage: 'Ticket not found',
      statusCode: 404,
    })

  if (ticket.status === 'CLOSED')
    throw createError({
      statusMessage: 'Ticket is closed',
      statusCode: 404,
    })

  // Update ticket status
  const newStatus = isSupport ? 'REPLIED' : 'OPEN'
  await prisma.support_ticket.update({
    where: { id: ticket.id },
    data: { status: newStatus },
  })

  // Fetch associated chat
  const chat = await prisma.support_chat.findUnique({
    where: { id: ticket.chat_id },
  })

  if (!chat)
    throw createError({
      statusMessage: 'Chat not found',
      statusCode: 404,
    })

  // Add new message
  const messageKey = Object.keys(chat.messages).length.toString()
  chat.messages[messageKey] = message

  // Update chat
  const updateData: any = { messages: chat.messages }
  if (isSupport && chat.agent_id === null) {
    updateData.agent_id = user.id
  }
  const chatUser = !isSupport
    ? user
    : await prisma.user.findUnique({ where: { id: chat.user_id } })
  const chatAgent = isSupport
    ? user
    : await prisma.user.findUnique({ where: { id: chat.agent_id } })

  if (chatAgent) {
    const sender = isSupport ? chatAgent : chatUser
    const receiver = isSupport ? chatUser : chatAgent

    await sendChatEmail(
      sender,
      receiver,
      chat,
      message,
      isSupport ? 'UserMessage' : 'SupportMessage',
    )
  }

  return (await prisma.support_chat.update({
    where: { id: chat.id },
    data: updateData,
  })) as unknown as Chat
}
