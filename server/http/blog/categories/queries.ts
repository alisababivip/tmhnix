import prisma from '~~/utils/prisma'

const postInclude = {
  post: {
    include: {
      author: {
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
    },
  },
}

export async function getCategories(posts: boolean): Promise<any[]> {
  const include = posts ? postInclude : {}

  const categories = await prisma.category.findMany()
  if (categories.length === 0) {
    await prisma.category.create({
      data: {
        name: 'Uncategorized',
        slug: 'uncategorized',
      },
    })
  }

  return await prisma.category.findMany({
    include: posts ? include : undefined,
  })
}

export async function getCategory(
  id: number,
  posts: boolean,
): Promise<any | null> {
  const include = posts ? postInclude : {}

  return await prisma.category.findUnique({
    where: { id },
    include: posts ? include : undefined,
  })
}

export async function createCategory(data: any): Promise<any> {
  return await prisma.category.create({
    data,
  })
}

export async function updateCategory(id: number, data: any): Promise<any> {
  return await prisma.category.update({
    where: { id },
    data,
  })
}

export async function deleteCategory(id: number): Promise<any> {
  return await prisma.category.delete({
    where: { id },
  })
}
