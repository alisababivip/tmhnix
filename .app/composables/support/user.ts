import type { JSONResponse, SupportTicket } from '~~/types'

export default function useUserSupport() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getTickets,
    getTicket,
    createTicket,
    closeTicket,
  }

  async function getTickets(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/support/tickets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getTicket(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/support/tickets/${ticketId}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function createTicket(ticket: SupportTicket): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/support/tickets`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        ticket: ticket,
      },
    })
    return response
  }

  async function closeTicket(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/support/tickets/close/${ticketId}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
