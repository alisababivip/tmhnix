import { handleController } from '~~/utils'
import { closeTicket, createTicket, getTicket, getTickets } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return getTickets(user.id)
  }),
  show: handleController(async (_, __, params, ___, _____, user) => {
    if (!user) throw new Error('User not found')
    return getTicket(user.id, params.ticketId)
  }),
  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return createTicket(user.id, body.ticket)
  }),
  close: handleController(async (_, __, params, ___, ____) => {
    try {
      const ticket = await closeTicket(params.ticketId)
      return {
        ...ticket,
        message: 'Ticket closed successfully',
      }
    } catch (error) {
      throw new Error('Ticket not found')
    }
  }),
}
