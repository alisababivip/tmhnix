import prisma from '~~/utils/prisma'

const postInclude = {
  post_tag: {
    select: {
      post: {
        include: {
          author: {
            include: {
              user: true,
            },
          },
          category: true,
        },
      },
    },
  },
}

export async function getTags(posts: boolean): Promise<any[]> {
  const include = posts ? postInclude : {}

  const tags = await prisma.tag.findMany()
  if (tags.length === 0) {
    await prisma.tag.create({
      data: {
        name: 'Uncategorized',
        slug: 'uncategorized',
      },
    })
  }

  return await prisma.tag.findMany({
    include: posts ? include : undefined,
  })
}

export async function getTag(
  slug: string,
  posts: boolean,
): Promise<any | null> {
  const include = posts ? postInclude : {}

  return await prisma.tag.findUnique({
    where: { slug: slug },
    include: posts ? include : undefined,
  })
}

export async function createTag(data: any): Promise<any> {
  return await prisma.tag.create({
    data,
  })
}

export async function updateTag(id: number, data: any): Promise<any> {
  return await prisma.tag.update({
    where: { id },
    data,
  })
}

export async function deleteTag(id: number): Promise<any> {
  return await prisma.tag.delete({
    where: { id },
  })
}
