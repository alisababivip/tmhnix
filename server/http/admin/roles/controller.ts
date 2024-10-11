import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import {
  createRole,
  deleteRole,
  deleteRoles,
  getRole,
  getRoles,
  syncPermissions,
  updateRole,
} from './queries'

// Function to cache the roles
async function cacheRoles() {
  const roles = await getRoles()
  await redis.set('roles', JSON.stringify(roles), 'EX', 3600)
}

// Initialize the cache when the file is loaded
cacheRoles()

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedRoles = await redis.get('roles')
      if (cachedRoles) return JSON.parse(cachedRoles)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getRoles()
  }),
  show: handleController(async (_, __, params) => {
    try {
      const cachedRoles = await redis.get('roles')
      if (cachedRoles) {
        const roles = JSON.parse(cachedRoles)
        const role = roles.find((r) => r.id === Number(params.id))
        if (role) return role
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getRole(Number(params.id))
  }),
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await createRole(body.role)
      await cacheRoles()
      return {
        ...response,
        message: 'Role created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateRole(Number(params.id), body.role)
      await cacheRoles()
      return {
        ...response,
        message: 'Role updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteRole(Number(params.id))
      await cacheRoles()
      return {
        message: 'Role removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  deleteBulk: handleController(async (_, __, ___, ____, body) => {
    try {
      await deleteRoles(body.ids)
      await cacheRoles()
      return {
        message: 'Roles removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  syncPermissions: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await syncPermissions(
        Number(params.id),
        body.permissionIds,
      )
      await cacheRoles()
      return {
        ...response,
        message: 'Role permissions synced successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
