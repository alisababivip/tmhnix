import type { Category, JSONResponse } from '~~/types'

export default function useCategory() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }

  async function getCategories(posts: boolean = true): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/categories`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        posts: posts,
      },
    })

    return response
  }

  async function getCategory(
    id: number,
    posts: boolean = true,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/categories/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        posts: posts,
      },
    })

    return response
  }

  async function createCategory(category: Category): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        category: category,
      },
    })

    return response
  }

  async function updateCategory(
    id: number,
    category: Category,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        category: category,
      },
    })

    return response
  }

  async function deleteCategory(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }
}
