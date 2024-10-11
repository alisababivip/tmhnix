export default function useUserEcommerceActions() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminEcommerceAnalytics = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/analytics`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminEcommerceAnalytics,
  }
}
