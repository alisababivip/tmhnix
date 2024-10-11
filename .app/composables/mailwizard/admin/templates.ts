export default function useAdminMailWizardTemplates() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getTemplates = async () => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/templates`, {
      credentials: 'include',
    })
  }

  const getTemplate = async (id) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/templates/${id}`, {
      credentials: 'include',
    })
  }

  const createTemplate = async (name, content, design) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/templates`, {
      method: 'POST',
      body: { name, content, design },
      credentials: 'include',
    })
  }

  const updateTemplate = async (id, name, content, design) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/templates/${id}`, {
      method: 'PUT',
      body: { name, content, design },
      credentials: 'include',
    })
  }

  const deleteTemplate = async (id) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
