export default function useAdminFaqs() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminFaqAnalytics = async () => {
    return await $fetch(`${apiPath}/api/admin/faq/analytics`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminFaqAnalytics,
  }
}
