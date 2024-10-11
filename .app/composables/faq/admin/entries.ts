export default function useAdminFaqEntries() {
  const apiPath = useRuntimeConfig().public.apiPath

  const getAdminFaqs = async () => {
    return await $fetch(`${apiPath}/api/admin/faq/entries`, {
      credentials: 'include',
    })
  }

  const getAdminFaq = async (id) => {
    return await $fetch(`${apiPath}/api/admin/faq/entries/${id}`, {
      credentials: 'include',
    })
  }

  const createAdminFaq = async (
    question: string,
    answer: string,
    category_id: number,
  ) => {
    return await $fetch(`${apiPath}/api/admin/faq/entries`, {
      method: 'POST',
      body: {
        question,
        answer,
        faq_category_id: category_id,
      },
      credentials: 'include',
    })
  }

  const updateAdminFaq = async (
    id: number,
    question: string,
    answer: string,
  ) => {
    return await $fetch(`${apiPath}/api/admin/faq/entries/${id}`, {
      method: 'PUT',
      body: {
        question,
        answer,
      },
      credentials: 'include',
    })
  }

  const deleteAdminFaq = async (id) => {
    return await $fetch(`${apiPath}/api/admin/faq/entries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    getAdminFaqs,
    getAdminFaq,
    createAdminFaq,
    updateAdminFaq,
    deleteAdminFaq,
  }
}
