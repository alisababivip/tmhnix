import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import { getExtensionsQuery, getSettings } from './queries'

export async function cacheSettings() {
  const settings = await getSettings()
  await redis.set('settings', JSON.stringify(settings), 'EX', 1800) // Cache for 30 minutes
}

cacheSettings()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedSettings = await redis.get('settings')
      if (cachedSettings) return JSON.parse(cachedSettings)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getSettings()
  }),
  extensions: handleController(async () => {
    const extensions = await getExtensionsQuery()
    return extensions.reduce((acc, curr) => {
      acc[curr.name] = curr.status
      return acc
    }, {})
  }),
}
