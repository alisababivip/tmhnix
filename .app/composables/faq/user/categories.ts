export default function useUserFaqCategories() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getCategories = async () => {
    return await $fetch(`${apiPath}/api/faq/categories`, {
      credentials: 'include',
    })
  }

  const getCategory = async (identifier) => {
    return await $fetch(`${apiPath}/api/faq/categories/${identifier}`, {
      credentials: 'include',
    })
  }

  return {
    getCategories,
    getCategory,
  }
}
