import type { Notification } from '~~/types'
const { getNotifications, createNotification, deleteNotification } =
  useNotification()

export const useNotificationsStore = defineStore({
  // unique id of the store across your application
  id: 'notifications',

  // a function that returns a fresh state
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),

  // optional getters
  getters: {
    count(state) {
      // getter function to count notifications
      return state.notifications.length
    },
  },

  // actions/mutations
  actions: {
    async fetchNotifications() {
      this.loading = true
      const response = await getNotifications()
      if (response.status === 'success') {
        this.notifications = response.data.result
      }
      this.loading = false
    },

    async createNotification(notification: Notification) {
      const response = await createNotification(notification)
      if (response.status === 'success') {
        this.notifications.push(response.data.result)
      }
    },

    async deleteNotification(id: Number) {
      const response = await deleteNotification(id)
      if (response.status === 'success') {
        this.notifications = this.notifications.filter(
          (notification) => notification.id !== id,
        )
      }
    },
  },
})
