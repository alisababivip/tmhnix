import type { JSONResponse } from '~~/types'

export default function useAuthor() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getAuthors,
    getAuthor,
    createAuthor,
    updateAuthor,
    deleteAuthor,
  }

  async function getAuthors(
    posts: boolean,
    status?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/authors`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        status: status,
        posts: posts,
      },
    })

    return response
  }

  async function getAuthor(id: number, posts: boolean): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/authors/${id}`, {
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

  async function createAuthor(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/authors`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function updateAuthor(
    id: number,
    status: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/authors/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        status: status,
      },
    })

    return response
  }

  async function deleteAuthor(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/authors/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }
}
