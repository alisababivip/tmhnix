import prisma from './prisma'

interface RoleWithPermissions {
  name: string
  permissions: string[]
}
type RolesAndPermissionsCache = { [roleId: string]: RoleWithPermissions }
let rolesAndPermissionsCache: RolesAndPermissionsCache = {}

export const loadRolesAndPermissions = async () => {
  try {
    const rolesWithPermissions = await prisma.role.findMany({
      include: {
        rolepermission: {
          include: {
            permission: true,
          },
        },
      },
    })

    const cache = rolesWithPermissions.reduce((acc, role) => {
      acc[role.id] = {
        name: role.name,
        permissions: role.rolepermission.map((rp) => rp.permission.name),
      }
      return acc
    }, {})

    rolesAndPermissionsCache = cache
  } catch (error) {
    console.error('Failed to load roles and permissions:', error)
  }
}

export const getRolesAndPermissionsCache = () => {
  return rolesAndPermissionsCache
}

// Load the roles and permissions into cache on startup.
loadRolesAndPermissions()
