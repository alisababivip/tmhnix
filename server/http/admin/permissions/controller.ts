import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import {
  createPermission,
  deletePermission,
  getPermission,
  getPermissions,
  updatePermission,
} from './queries'

// Function to cache the permissions
async function cachePermissions() {
  const permissions = await getPermissions()
  await redis.set('permissions', JSON.stringify(permissions), 'EX', 3600)
}

// Initialize the cache when the file is loaded
cachePermissions()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedPermissions = await redis.get('permissions')
      if (cachedPermissions) return JSON.parse(cachedPermissions)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPermissions()
  }),
  show: handleController(async (_, __, params) => {
    try {
      const cachedPermissions = await redis.get('permissions')
      if (cachedPermissions) {
        const permissions = JSON.parse(cachedPermissions)
        const permission = permissions.find((p) => p.id === Number(params.id))
        if (permission) return permission
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getPermission(Number(params.id))
  }),
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await createPermission(body.permission)
      await cachePermissions()
      return {
        ...response,
        message: 'Permission created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updatePermission(
        Number(params.id),
        body.permission,
      )
      await cachePermissions()
      return {
        ...response,
        message: 'Permission updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deletePermission(Number(params.id))
      await cachePermissions()
      return {
        message: 'Permission remvoed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
