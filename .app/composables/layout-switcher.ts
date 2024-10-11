import { TairoSidebarLayout } from '#components'
import CollapseLayout from '~~/components/collapse/Layout'

export function useLayoutSwitcher(layout: string = 'sidebar') {
  const layouts = [
    {
      name: 'sidebar',
      label: 'Sidebar',
      component: TairoSidebarLayout,
    },
    {
      name: 'collapse',
      label: 'Collapse',
      component: CollapseLayout,
    },
  ] as const

  // Initialize from local storage or default to 'sidebar'
  const activeLayoutName = useState('layout-switcher-active', () => {
    return localStorage.getItem('layout-switcher-active') || layout
  })

  // Watch for changes and save to local storage
  watch(activeLayoutName, (newValue) => {
    localStorage.setItem('layout-switcher-active', newValue)
  })

  const activeLayout = computed(() => {
    return layouts.find((layout) => layout.name === activeLayoutName.value)
  })

  const activeLayoutComponent = computed(() => {
    return activeLayout.value?.component || TairoSidebarLayout
  })

  return {
    layouts,
    activeLayout,
    activeLayoutName,
    activeLayoutComponent,
  }
}
