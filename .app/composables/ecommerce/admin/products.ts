export default function useAdminProducts() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminProducts = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/products`, {
      credentials: 'include',
    })
  }

  const getAdminProduct = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/products/${id}`, {
      credentials: 'include',
    })
  }

  const createAdminProduct = async (
    name: string,
    description: string,
    type: string,
    price: number,
    currency: string,
    wallet_type: string,
    category_id: number,
    inventory_quantity: number,
    file_path?: string,
    image?: string | null,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/products`, {
      method: 'POST',
      body: {
        name,
        description,
        type,
        price,
        currency,
        wallet_type,
        category_id,
        inventory_quantity,
        file_path,
        image,
      },
      credentials: 'include',
    })
  }

  const updateAdminProduct = async (
    id: number,
    name: string,
    description: string,
    type: string,
    price: number,
    currency: string,
    wallet_type: string,
    category_id: number,
    inventory_quantity: number,
    file_path?: string,
    status?: string,
    image?: string | null,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/products/${id}`, {
      method: 'PUT',
      body: {
        name,
        description,
        type,
        price,
        currency,
        wallet_type,
        category_id,
        inventory_quantity,
        file_path,
        status,
        image,
      },
      credentials: 'include',
    })
  }

  const deleteAdminProduct = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminProducts,
    getAdminProduct,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
  }
}
