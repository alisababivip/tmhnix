export default function useAdminP2PPaymentMethods() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminPaymentMethods = async () => {
    return await $fetch(`${apiPath}/api/admin/p2p/payment-methods`, {
      credentials: 'include',
    })
  }

  const getAdminPaymentMethod = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/payment-methods/${id}`, {
      credentials: 'include',
    })
  }

  const createAdminPaymentMethod = async (name, instructions, image) => {
    return await $fetch(`${apiPath}/api/admin/p2p/payment-methods`, {
      method: 'POST',
      body: { name, instructions, image },
      credentials: 'include',
    })
  }

  const updateAdminPaymentMethod = async (
    id,
    name,
    instructions,
    currency,
    image,
    status,
  ) => {
    return await $fetch(`${apiPath}/api/admin/p2p/payment-methods/${id}`, {
      method: 'PUT',
      body: { name, instructions, currency, image, status },
      credentials: 'include',
    })
  }

  const deleteAdminPaymentMethod = async (id) => {
    return await $fetch(`${apiPath}/api/admin/p2p/payment-methods/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminPaymentMethods,
    getAdminPaymentMethod,
    createAdminPaymentMethod,
    updateAdminPaymentMethod,
    deleteAdminPaymentMethod,
  }
}
