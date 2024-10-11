export default function useUserP2pActions() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2pAnalytics = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/analytics`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminP2pAnalytics,
  }
}
