import type { Chat, SupportTicket } from '~~/types'

export const useUserSupportStore = defineStore({
  // unique id of the store across your application
  id: 'userSupport',

  // a function that returns a fresh state
  state: () => ({
    tickets: [] as SupportTicket[],
    currentTicket: null as SupportTicket | null,
    chat: null as Chat | null,
    loading: false,
  }),

  // optional getters
  getters: {
    ticketCount(state) {
      return state.tickets.length
    },
  },

  // actions/mutations
  actions: {
    async fetchTickets() {
      this.loading = true
      const { getTickets } = useSupport()
      try {
        const response = await getTickets()
        if (response.status === 'success') {
          this.tickets = response.data.result
        }
      } catch (error) {
        return error
      }
      this.loading = false
    },

    async fetchTicket(ticketId: string) {
      const { getTicket } = useSupport()
      try {
        const response = await getTicket(ticketId)
        if (response.status === 'success') {
          this.currentTicket = response.data.result
        }
      } catch (error) {
        return error
      }
    },

    async fetchChat(ticketId: string) {
      const { getMessages } = useSupport()
      try {
        const response = await getMessages(ticketId)
        if (response.status === 'success') {
          this.chat = response.data.result
        }
      } catch (error) {
        return error
      }
    },
  },
})
