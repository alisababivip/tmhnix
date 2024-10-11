import type { Permission, Role } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getRoles(): Promise<Role[]> {
  return (await prisma.role.findMany({
    include: {
      rolepermission: {
        include: {
          permission: true,
        },
      },
    },
  })) as unknown as Role[]
}

export async function getRole(id: number): Promise<Role | null> {
  return (await prisma.role.findUnique({
    where: {
      id: id,
    },
    include: {
      rolepermission: {
        include: {
          permission: true,
        },
      },
    },
  })) as unknown as Role
}

export async function createRole(data: any): Promise<Role> {
  try {
    return (await prisma.role.create({
      data: data,
    })) as Role
  } catch (error) {
    if (error.code === 'P2002' && error.meta.target.includes('role_name_key')) {
      throw new Error('Role with this name already exists')
    }
    throw error
  }
}

export async function updateRole(id: number, data: any): Promise<Role> {
  try {
    return (await prisma.role.update({
      where: {
        id: id,
      },
      data: data,
    })) as unknown as Role
  } catch (error) {
    if (error.code === 'P2002' && error.meta.target.includes('role_name_key')) {
      throw new Error('Role with this name already exists')
    }
    throw error
  }
}

export async function deleteRole(id: number): Promise<void> {
  const deleteRolePermission = prisma.rolepermission.deleteMany({
    where: {
      role_id: id,
    },
  })

  const deleteRole = prisma.role.delete({
    where: {
      id: id,
    },
  })

  await prisma.$transaction([deleteRolePermission, deleteRole])
}

export async function deleteRoles(ids: number[]): Promise<void> {
  const deleteRolePermission = prisma.rolepermission.deleteMany({
    where: {
      role_id: { in: ids },
    },
  })

  const deleteRole = prisma.role.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  await prisma.$transaction([deleteRolePermission, deleteRole])
}

export async function syncPermissions(
  id: number,
  permissions: Permission[],
): Promise<Role> {
  const role = await prisma.role.findUnique({
    where: { id: id },
    include: { rolepermission: true },
  })

  if (!role) throw new Error('Role not found')

  const existingPermissionIds = role.rolepermission.map(
    (rp) => rp.permission_id,
  )

  const newPermissionIds = permissions.map((perm) => perm.id)

  // Find the permissions to be added and removed
  const toBeAdded = newPermissionIds.filter(
    (permId) => !existingPermissionIds.includes(permId),
  )
  const toBeRemoved = existingPermissionIds.filter(
    (permId) => !newPermissionIds.includes(permId),
  )

  // Remove obsolete permissions
  if (toBeRemoved.length > 0) {
    await prisma.rolepermission.deleteMany({
      where: {
        role_id: id,
        permission_id: { in: toBeRemoved },
      },
    })
  }

  // Add new permissions
  if (toBeAdded.length > 0) {
    await prisma.role.update({
      where: { id: id },
      data: {
        rolepermission: {
          create: toBeAdded.map((permId) => ({
            permission_id: permId,
          })),
        },
      },
    })
  }

  // Get the updated role
  const updatedRole = await getRole(id)

  return updatedRole as unknown as Role
}
