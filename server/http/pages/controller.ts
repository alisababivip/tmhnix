import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import { getPage, getPages } from './queries'

export async function cachePages() {
  const pages = await getPages()
  await redis.set('pages', JSON.stringify(pages), 'EX', 43200) // Cache for 12 hours (720 * 60)
}

cachePages()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedPages = await redis.get('pages')
      if (cachedPages) return JSON.parse(cachedPages)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPages()
  }),
  show: handleController(async (_, __, params) => {
    try {
      const cachedPages = await redis.get('pages')
      if (cachedPages) {
        const pages = JSON.parse(cachedPages)
        const page = pages.find((p) => p.id === Number(params.id))
        if (page) return page
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPage(Number(params.id))
  }),
}
