import type { User } from '~~/types'

interface State {
  profile: User | null
  lastFetched: number | null
  loggedOut: boolean
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): State => ({
    profile: null,
    lastFetched: null,
    loggedOut: false,
  }),
  getters: {
    isLoggedIn: (state) => state.profile !== null,
    isProfileExpired: (state) => {
      if (!state.lastFetched) return true
      const now = Date.now()
      const diffMinutes = (now - state.lastFetched) / (1000 * 60)
      return diffMinutes > 15 // profile expires after 15 minutes
    },
    getProfile: (state) => state.profile,
    getRole: (state) => state.profile?.role.name,
    getPermissions: (state) =>
      state.profile?.role.rolepermission.map((rp) => rp.permission.name),
    emailVerified: (state) => state.profile?.email_verified,
  },
  actions: {
    setProfile(profile: User | null) {
      this.profile = profile
      this.lastFetched = Date.now()
      this.loggedOut = false
    },
    clearProfile() {
      this.profile = null
      this.lastFetched = null
      this.loggedOut = true
    },
    setIsLoggedIn(isLoggedIn: boolean) {
      if (isLoggedIn) {
        this.fetchProfile()
      } else {
        this.clearProfile()
      }
    },
    async fetchProfile() {
      try {
        const { getProfile } = useAuth()
        const response = await getProfile()
        if (response.status === 'fail') {
          this.clearProfile()
          return
        }
        this.setProfile(response.data.result)
        this.updatePermissions()
      } catch (error) {
        console.error(error)
      }
    },
    updatePermissions() {
      if (!this.profile) return
      const { usePermissions, useRole } = useGate()

      const userPermissions = usePermissions()
      const userRole = useRole()

      userRole.value = this.profile?.role?.name
      userPermissions.value = this.profile?.role?.rolepermission?.map(
        (rp) => rp.permission.name,
      )
    },
  },
})
