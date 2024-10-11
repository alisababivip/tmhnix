import type { RouteLocationRaw } from 'vue-router'
import topNavData from '~~/data/navigation-topnav.json'

export interface TairoTopnavResolvedConfig {
  name: string
  divider?: boolean
  icon: {
    name: string
    class?: string
  }
  children?: any[]
  component?: {
    name: string
    props?: any
  }
  to?: RouteLocationRaw
  click?: () => void | Promise<void>
  activePath?: string
}

export function useTopnav() {
  const route = useRoute()
  const app = useAppConfig()
  const userStore = useUserStore()
  const userRole = computed(() => userStore.getRole)
  const userPermissions = computed(() => userStore.getPermissions)
  const extensionStore = useExtensionStore()
  const extensions = computed(() =>
    extensionStore.extensions.filter((extension) => extension.status),
  )

  const hasAccess = (item) => {
    if (item.extension) {
      const extension = extensions.value.find(
        (extension) => extension.name === item.extension,
      )
      if (!extension || (extension && !extension.status)) {
        return false
      }
    }

    if (userRole.value === 'Super Admin') {
      return true
    }

    if (
      item.permission &&
      !userPermissions.value.some((permission) =>
        permission.includes(item.permission),
      )
    ) {
      return false
    }

    if (item.children) {
      item.children = item.children.filter(hasAccess)
      if (item.children.length === 0) {
        return false
      }
    }

    return true
  }

  const filteredTopNav = computed(() => {
    const baseNavigation = topNavData // Replace with your actual navigation data
    const accessibleItems = baseNavigation.filter(hasAccess)

    // Remove trailing divider, if any
    if (
      accessibleItems.length > 0 &&
      accessibleItems[accessibleItems.length - 1].divider
    ) {
      accessibleItems.pop()
    }

    return accessibleItems
  })

  const menuItems = computed(() => {
    if (app.tairo.topnav?.navigation?.enabled === false) {
      return []
    }
    return filteredTopNav.value.map((navigation) => ({
      ...navigation,
    }))
  })

  const isMobileOpen = useState('collapse-open', () => false)

  const activeMenuItem = computed(() => {
    return menuItems.value?.find((item) => {
      if (item.activePath) {
        return route.path.startsWith(item.activePath)
      }
      if (item.to) {
        return route.path.startsWith(item.to.toString())
      }
      return false
    })
  })
  const selectedMenuItem = useState(
    'topnav-selected-menu-item',
    () => activeMenuItem.value,
  )
  watch(activeMenuItem, (item) => {
    selectedMenuItem.value = item
  })

  if (process.client) {
    const { lg, xl } = useTailwindBreakpoints()
    /*watch(xl, (isXl) => {
      if (!isXl) {
        isOpen.value = false
      }
    })*/
  }

  return {
    menuItems,
    activeMenuItem,
    selectedMenuItem,
    isMobileOpen,
  }
}
