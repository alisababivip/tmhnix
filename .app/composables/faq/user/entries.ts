export default function useUserFaqEntrie() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getFaqs = async (categoryIdentifier) => {
    const queryParams = categoryIdentifier
      ? `?category=${categoryIdentifier}`
      : ''
    return await $fetch(`${apiPath}/api/faq/entries${queryParams}`, {
      credentials: 'include',
    })
  }

  const getFaq = async (id) => {
    return await $fetch(`${apiPath}/api/faq/entries/${id}`, {
      credentials: 'include',
    })
  }

  return {
    getFaqs,
    getFaq,
  }
}
