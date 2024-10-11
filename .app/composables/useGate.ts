import { useStorage } from '@vueuse/core'

export default function useGate() {
  return {
    useRole,
    usePermissions,
  }

  function useRole(): Ref<string> {
    return useStorage('role', '')
  }

  function usePermissions(): Ref<string[]> {
    return useStorage('permissions', [])
  }
}
