import type { JSONResponse } from '~~/types'

export default function useAdminSupport() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getTicketsAdmin,
    getTicketAdmin,
    openTicket,
    assignAgent,
    deleteTicket,
  }

  async function getTicketsAdmin(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/admin/support/tickets`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }

  async function getTicketAdmin(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/support/tickets/${ticketId}`,
      {
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }

  async function openTicket(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/support/tickets/open/${ticketId}`,
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

  async function assignAgent(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/support/tickets/assign/${ticketId}`,
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

  async function deleteTicket(ticketId: string): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/support/tickets/${ticketId}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
      },
    )
    return response
  }
}
