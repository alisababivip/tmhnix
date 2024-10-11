const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/confirm',
]
const GUEST_PAGES = [...AUTH_PAGES, '/trade', '/binary', '/blog', '/page']
const GUEST_PAGES_EXCLUDE = ['/blog/author']

const startsWithAny = (path: string, routes: any[]) =>
  routes.some((route: any) => path.startsWith(route))

// Utility function to throw error
const throwError = (statusCode: number, message: string) => {
  throw createError({ statusCode, message })
}

// Utility function to check user permissions
function checkUserPermissions(to: Route, userStore: any): boolean {
  if (!to?.meta?.role && !to?.meta?.permissions) return true

  const userRole = userStore.profile.role.name
  const userPermissionsValue = new Set(
    userStore.profile.role.rolepermission.map(
      (rp: { permission: { name: any } }) => rp.permission.name,
    ),
  )

  const routePermissions = to.meta.permissions

  const hasRequiredPermissions = (
    permissions: string[] | undefined,
  ): boolean => {
    if (!permissions || permissions.length === 0 || permissions[0] === '')
      return true

    return permissions.some((permission) =>
      userPermissionsValue.has(permission),
    )
  }

  if (
    to.meta.role !== 'Super Admin' &&
    userRole !== 'Super Admin' &&
    !hasRequiredPermissions(routePermissions)
  ) {
    throwError(401, "You don't have permission to access this page.")
  }

  return true
}

export default defineNuxtRouteMiddleware(
  async (to: { path: string }, from: any) => {
    if (to.path.startsWith('/api')) return true

    const settingsStore = useSettingsStore()
    const userStore = useUserStore()
    const { toast } = useUtils()

    try {
      // Fetch settings first
      await settingsStore.fetchSettings()
      if (
        settingsStore.settings &&
        settingsStore.settings.site_maintenance &&
        to.path === '/register'
      ) {
        throwError(503, 'Site is currently under maintenance.')
      }
      if (
        (to.path === '' || to.path === '/') &&
        !settingsStore.settings?.frontend
      ) {
        return '/login'
      }

      // Check if the path is a guest page
      const isGuest =
        startsWithAny(to.path, GUEST_PAGES) &&
        !startsWithAny(to.path, GUEST_PAGES_EXCLUDE)

      // Fetch profile if needed
      if (!userStore.isLoggedIn && !userStore.loggedOut) {
        await userStore.fetchProfile()
      }

      if (to.path === '/') return true

      if (userStore.isLoggedIn) {
        if (AUTH_PAGES.includes(to.path)) return '/user'

        await shouldProceedBasedOnProfile(userStore)
        await shouldProceedDuringMaintenance(settingsStore, userStore)

        if (!checkUserPermissions(to, userStore)) {
          throwError(401, "You don't have permission to access this page.")
        }

        return true
      }

      // If it's a guest page, allow access
      if (isGuest) return true

      return '/login'
    } catch (error) {
      toast.dangerText(error.message || 'An unexpected error occurred.')
      return false
    }
  },
)

async function shouldProceedBasedOnProfile(userStore: {
  isProfileExpired: any
  profile: any
  fetchProfile: () => any
}) {
  if (userStore.isProfileExpired || !userStore.profile) {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      throwError(400, 'An error occurred while trying to get your profile.')
    }
  }
  return true
}

async function shouldProceedDuringMaintenance(
  settingsStore: { settings: { site_maintenance: any } },
  userStore: { profile: { role: { name: any; rolepermission: any[] } } },
) {
  if (settingsStore.settings.site_maintenance) {
    const userRole = userStore.profile.role.name
    const userPermissions = new Set(
      userStore.profile.role.rolepermission.map(
        (rp: { permission: { name: any } }) => rp.permission.name,
      ),
    )

    if (!(userRole === 'Super Admin' || userPermissions.has('Access Admin'))) {
      throwError(503, 'Site is currently under maintenance.')
    }
  }
  return true
}
