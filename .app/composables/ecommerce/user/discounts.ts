export default function useUserDiscounts() {
  const apiPath = useRuntimeConfig().public.apiPath

  const applyDiscount = async (productId: number, code: string) => {
    return await $fetch(`${apiPath}/api/ecommerce/discounts/${productId}`, {
      method: 'POST',
      credentials: 'include',
      body: {
        code,
      },
    })
  }

  return {
    applyDiscount,
  }
}
