export default function useAdminDiscounts() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminDiscounts = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/discounts`, {
      credentials: 'include',
    })
  }

  const createAdminDiscount = async (
    code: string,
    percentage: number,
    validUntil: string,
    productId: number,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/discounts`, {
      method: 'POST',
      body: {
        code,
        percentage,
        valid_until: validUntil,
        product_id: productId,
      },
      credentials: 'include',
    })
  }

  const updateAdminDiscount = async (
    id: number,
    code: string,
    percentage: number,
    validUntil: string,
    productId: number,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/discounts/${id}`, {
      method: 'PUT',
      body: {
        code,
        percentage,
        valid_until: validUntil,
        product_id: productId,
      },
      credentials: 'include',
    })
  }

  const deleteAdminDiscount = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/discounts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminDiscounts,
    createAdminDiscount,
    updateAdminDiscount,
    deleteAdminDiscount,
  }
}
