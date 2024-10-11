export default function useAdminP2PEscrows() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminP2PEscrows = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/escrow`, {
      credentials: 'include',
    })
  }

  const getAdminP2PEscrow = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/escrow/${id}`, {
      credentials: 'include',
    })
  }

  return {
    getAdminP2PEscrows,
    getAdminP2PEscrow,
  }
}
