export default function useUserOrders() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserOrders = async () => {
    return await $fetch(`${apiPath}/api/ecommerce/orders`, {
      credentials: 'include',
    })
  }

  const getUserOrder = async (id: number) => {
    return await $fetch(`${apiPath}/api/ecommerce/orders/${id}`, {
      credentials: 'include',
    })
  }

  const createUserOrder = async (
    productIds: number[],
    quantities: number[],
  ) => {
    return await $fetch(`${apiPath}/api/ecommerce/orders/create`, {
      method: 'POST',
      body: { product_ids: productIds, quantities },
      credentials: 'include',
    })
  }

  const createOrder = async (productId: number, discountId: number) => {
    return await $fetch(`${apiPath}/api/ecommerce/orders/store`, {
      method: 'POST',
      body: { product_id: productId, discount_id: discountId },
      credentials: 'include',
    })
  }

  return { createOrder, getUserOrders, getUserOrder, createUserOrder }
}
