export default function useAdminMailWizardBlocks() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getBlocks = async () => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/blocks`, {
      credentials: 'include',
    })
  }

  const createBlock = async (name, design) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/blocks`, {
      method: 'POST',
      body: { name, design },
      credentials: 'include',
    })
  }

  const updateBlock = async (id, name, design) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/blocks/${id}`, {
      method: 'PUT',
      body: { name, design },
      credentials: 'include',
    })
  }

  const deleteBlock = async (id) => {
    return await $fetch(`${apiPath}/api/admin/mailwizard/blocks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
  }
}
