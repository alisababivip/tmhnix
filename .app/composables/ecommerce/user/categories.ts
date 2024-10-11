export default function useUserCategories() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getUserCategories = async () => {
    return await $fetch(`${apiPath}/api/ecommerce/categories`, {
      credentials: 'include',
    })
  }

  const getUserCategory = async (id: number) => {
    return await $fetch(`${apiPath}/api/ecommerce/categories/${id}`, {
      credentials: 'include',
    })
  }

  return {
    getUserCategories,
    getUserCategory,
  }
}
