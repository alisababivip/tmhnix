import type { JSONResponse, Post } from '~~/types'

export default function usePost() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
  }

  async function getPosts(
    user?: string,
    category?: string,
    tag?: string,
    status?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      query: {
        user: user,
        category: category,
        tag: tag,
        status: status,
      },
    })

    return response
  }

  async function getPost(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts/${id}`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }

  async function createPost(post: Post): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        post: post,
      },
    })

    return response
  }

  async function updatePost(slug: string, post: Post): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts/${slug}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
      body: {
        post: post,
      },
    })

    return response
  }

  async function updatePostStatus(
    id: number,
    status: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts/${id}/status`, {
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

  async function deletePost(id: number): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/blog/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })

    return response
  }
}
