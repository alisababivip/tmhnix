import type { RouteLocationRaw } from 'vue-router'

export interface TairoCollapseResolvedConfig {
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
  /**
   * @default 'start'
   */
  position?: 'start' | 'end'
}

export function useCollapse() {
  const app = useAppConfig()

  // Initialize isOpen from localStorage or default to true
  const isOpen = useState('collapse-open', () => {
    const savedState = localStorage.getItem('collapse-open')
    return savedState !== null ? JSON.parse(savedState) : true
  })

  // Initialize isMobileOpen from localStorage or default to false
  const isMobileOpen = useState('collapse-mobile-open', () => {
    const savedState = localStorage.getItem('collapse-mobile-open')
    return savedState !== null ? JSON.parse(savedState) : false
  })

  // Watch for changes and save isOpen to localStorage
  watch(isOpen, (newValue) => {
    localStorage.setItem('collapse-open', JSON.stringify(newValue))
  })

  // Watch for changes and save isMobileOpen to localStorage
  watch(isMobileOpen, (newValue) => {
    localStorage.setItem('collapse-mobile-open', JSON.stringify(newValue))
  })

  const header = computed(() => {
    return app.tairo.collapse?.navigation?.header
  })

  const footer = computed(() => {
    return app.tairo.collapse?.navigation?.footer
  })

  function toggle() {
    // If no sidebar item is selected, open the first one
    const { lg } = useTailwindBreakpoints()
    if (lg.value) {
      isOpen.value = !isOpen.value
    } else {
      isMobileOpen.value = !isMobileOpen.value
    }
  }

  if (process.client) {
    const route = useRoute()
    const { lg, xl } = useTailwindBreakpoints()
    watch(lg, (isLg) => {
      if (isLg) {
        isMobileOpen.value = false
      }
    })
    watch(
      () => route.fullPath,
      () => {
        if (!lg.value) {
          isMobileOpen.value = false
        }
      },
    )
  }

  return {
    toggle,
    isOpen,
    isMobileOpen,
    header,
    footer,
  }
}
