export default function useAdminMailWizard() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminMailwizardAnalytics = async () => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/analytics`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  return {
    getAdminMailwizardAnalytics,
  }
}
