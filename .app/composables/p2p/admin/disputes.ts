export default function useAdminP2PDisputes() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2PDisputes = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/disputes`, {
      credentials: 'include',
    })
  }

  const getAdminP2PDispute = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/disputes/${id}`, {
      credentials: 'include',
    })
  }

  const resolveAdminP2PDispute = async (id, resolution) => {
    return await $fetch(`${apiPath}/api/admin/p2p/disputes/${id}`, {
      method: 'PUT',
      body: { resolution },
      credentials: 'include',
    })
  }

  const markAdminP2PDisputeAsResolved = async (id) => {
    return await $fetch(
      `${apiPath}/api/admin/p2p/disputes/${id}/markAsResolved`,
      {
        method: 'PUT',
        credentials: 'include',
      },
    )
  }

  return {
    getAdminP2PDisputes,
    getAdminP2PDispute,
    resolveAdminP2PDispute,
    markAdminP2PDisputeAsResolved,
  }
}
