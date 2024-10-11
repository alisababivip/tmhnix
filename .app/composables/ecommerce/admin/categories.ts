export default function useAdminCategories() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminCategories = async () => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/categories`, {
      credentials: 'include',
    })
  }

  const createAdminCategory = async (
    name: string,
    description: string,
    image: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/categories`, {
      method: 'POST',
      body: { name, description, image },
      credentials: 'include',
    })
  }

  const updateAdminCategory = async (
    id: number,
    name: string,
    description: string,
    status: string,
    image: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/categories/${id}`, {
      method: 'PUT',
      body: { name, description, status, image },
      credentials: 'include',
    })
  }

  const deleteAdminCategory = async (id: number) => {
    return await $fetch(`${apiPath}/api/admin/ecommerce/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
  }
}
