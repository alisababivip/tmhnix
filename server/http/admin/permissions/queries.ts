import type { Permission } from '~~/types'

import prisma from '~~/utils/prisma'

export async function getPermissions(): Promise<Permission[]> {
  return (await prisma.permission.findMany({
    include: {
      rolepermission: true,
    },
  })) as unknown as Permission[]
}

export async function getPermission(id: number): Promise<Permission> {
  return (await prisma.permission.findUnique({
    where: {
      id: id,
    },
  })) as unknown as Permission
}

export async function createPermission(data: any): Promise<Permission> {
  return (await prisma.permission.create({
    data: data,
  })) as unknown as Permission
}

export async function updatePermission(
  id: number,
  data: any,
): Promise<Permission> {
  return (await prisma.permission.update({
    where: {
      id: id,
    },
    data: data,
  })) as unknown as Permission
}

export async function deletePermission(id: number): Promise<void> {
  await prisma.permission.delete({
    where: {
      id: id,
    },
  })
}
