import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const { usePermissions, useRole } = useGate()
  const userRole = useRole()
  const userPermissions = usePermissions()

  function hasNotPermission(binding: any) {
    if (userRole.value === 'Super Admin') return false // No need to check permissions for Super Admin
    if (!binding) return false
    const activePermissions = typeof binding === 'string' ? [binding] : binding
    return !activePermissions.some((permission: any) =>
      userPermissions.value.includes(permission),
    )
  }

  function hasPermission(binding: any) {
    if (userRole.value === 'Super Admin') return true // No need to check permissions for Super Admin
    if (!binding) return true
    const activePermissions = typeof binding === 'string' ? [binding] : binding
    // If no permissions are required, allow access
    if (activePermissions.length === 0) return true
    return !hasNotPermission(binding)
  }

  function hasNotRole(binding: any) {
    if (!binding) return false
    const activeRoles = typeof binding === 'string' ? [binding] : binding
    return !activeRoles.includes(userRole.value)
  }

  function hasRole(binding: any) {
    if (!binding) return true
    return !hasNotRole(binding)
  }

  nuxtApp.vueApp.directive('can', {
    mounted(el, binding) {
      if (binding.arg === 'not') {
        if (hasPermission(binding.value)) {
          el.remove()
        }
        return
      }
      if (!hasPermission(binding.value)) {
        el.remove()
      }
    },
  })

  nuxtApp.vueApp.directive('role', {
    mounted(el, binding) {
      if (binding.arg === 'not') {
        if (hasRole(binding.value)) {
          el.remove()
        }
        return
      }
      if (!hasRole(binding.value)) {
        el.remove()
      }
    },
  })
})
