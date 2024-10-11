export default function useAdminOrders() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminOrders = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/orders`, {
      credentials: 'include',
    })
  }

  const getAdminOrder = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/orders/${id}`, {
      credentials: 'include',
    })
  }

  const updateAdminOrderStatus = async (id: number, status: string) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/orders/${id}`, {
      method: 'PUT',
      body: { status },
      credentials: 'include',
    })
  }

  const updateAdminOrderItem = async (id: number, key: string) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/orders/item/${id}`, {
      method: 'PUT',
      body: { key },
      credentials: 'include',
    })
  }

  const deleteAdminOrder = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminOrders,
    getAdminOrder,
    updateAdminOrderStatus,
    updateAdminOrderItem,
    deleteAdminOrder,
  }
}
