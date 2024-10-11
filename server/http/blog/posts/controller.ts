import { handleController } from '~~/utils'
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
  updatePostStatus,
} from './queries'
import { redis } from '~~/utils/redis'

// Function to cache the posts
async function cachePosts() {
  const posts = await getPosts()
  await redis.set('posts', JSON.stringify(posts), 'EX', 3600)
}

// Initialize the cache when the file is loaded
cachePosts()

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      const cachedPosts = await redis.get('posts')
      if (cachedPosts) return JSON.parse(cachedPosts)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPosts()
  }),

  show: handleController(async (_, __, params) => {
    try {
      const cachedPosts = await redis.get('posts')
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts)
        const post = posts.find((p) => p.id === Number(params.id))
        if (post) return post
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPost(Number(params.id))
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    const newPost = await createPost(user.id, body.post)
    cachePosts() // Update the cache
    return newPost
  }),

  update: handleController(async (_, __, params, ___, body, user) => {
    if (!user) throw new Error('User not found')
    const updatedPost = await updatePost(user.id, params.slug, body.post)
    cachePosts() // Update the cache
    return updatedPost
  }),

  updateStatus: handleController(async (_, __, params, ___, body) => {
    const updatedPost = await updatePostStatus(Number(params.id), body.status)
    cachePosts() // Update the cache
    return updatedPost
  }),

  delete: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    const deletedPost = await deletePost(user.id, Number(params.id))
    cachePosts() // Update the cache
    return deletedPost
  }),
}
