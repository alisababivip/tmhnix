export default function useUserPaymentMethods() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserPaymentMethods = async () => {
    return await $fetch(`${apiPath}/api/p2p/payment-methods`, {
      credentials: 'include',
    })
  }

  const getUserPaymentMethod = async (id) => {
    return await $fetch(`${apiPath}/api/p2p/payment-methods/${id}`, {
      credentials: 'include',
    })
  }

  const createUserPaymentMethod = async (
    name,
    instructions,
    currency,
    image,
  ) => {
    return await $fetch(`${apiPath}/api/p2p/payment-methods`, {
      method: 'POST',
      body: { name, instructions, currency, image },
      credentials: 'include',
    })
  }

  const deleteUserPaymentMethod = async (id) => {
    return await $fetch(`${apiPath}/api/p2p/payment-methods/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const updateUserPaymentMethod = async (
    id,
    name,
    instructions,
    currency,
    image,
  ) => {
    return await $fetch(`${apiPath}/api/p2p/payment-methods/${id}`, {
      method: 'PUT',
      body: { name, instructions, currency, image },
      credentials: 'include',
    })
  }

  return {
    getUserPaymentMethods,
    getUserPaymentMethod,
    createUserPaymentMethod,
    deleteUserPaymentMethod,
    updateUserPaymentMethod,
  }
}
