import { handleController } from '~~/utils'
import {
  assignTicket,
  deleteTicket,
  getTicket,
  listTickets,
  openTicket,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listTickets()
  }),
  show: handleController(async (_, __, params) => {
    return getTicket(params.ticketId)
  }),
  open: handleController(async (_, __, params) => {
    try {
      const ticket = await openTicket(params.ticketId)
      return {
        ...ticket,
        message: 'Ticket opened successfully',
      }
    } catch (error) {
      throw new Error('Ticket not found')
    }
  }),
  assign: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) {
      throw new Error('User not found')
    }
    try {
      await assignTicket(user.id, params.ticketId)
      return {
        agent_id: user.id,
        message: 'Ticket assigned successfully',
      }
    } catch (error) {
      throw new Error('Ticket not found')
    }
  }),
  delete: handleController(async (_, __, params, ___, ____) => {
    try {
      await deleteTicket(params.ticketId)
      return {
        message: 'Ticket deleted successfully',
      }
    } catch (error) {
      throw new Error('Ticket not found')
    }
  }),
}
