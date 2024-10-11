export default function useUserProducts() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserProducts = async () => {
    return await $fetch(`${apiPath}/api/ecommerce/products`, {
      credentials: 'include',
    })
  }

  const getUserProduct = async (id: number) => {
    return await $fetch(`${apiPath}/api/ecommerce/products/${id}`, {
      credentials: 'include',
    })
  }

  return {
    getUserProducts,
    getUserProduct,
  }
}
