import type { Author, AuthorStatus } from '~~/types'
import { sendAuthorStatusUpdateEmail } from '~~/utils/emails'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'

const userInclude = {
  select: {
    id: true,
    uuid: true,
    first_name: true,
    last_name: true,
    avatar: true,
  },
}

export async function getAuthors(
  posts: boolean,
  status?: string,
): Promise<Author[]> {
  const where = {}
  if (status) {
    where['status'] = status
  }
  return prisma.author.findMany({
    where,
    include: {
      user: userInclude,
      posts: posts ? true : false,
    },
  }) as any
}

export async function getAuthor(
  id: number,
  posts: boolean,
): Promise<any | null> {
  return await prisma.author.findUnique({
    where: { id },
    include: {
      user: userInclude,
      posts: posts,
    },
  })
}

export async function createAuthor(userId: number): Promise<any> {
  return await prisma.author.create({
    data: {
      uuid: makeUuid(),
      user: {
        connect: {
          id: userId,
        },
      },
      status: 'PENDING',
    },
  })
}

export async function updateAuthor(
  id: number,
  status: AuthorStatus,
): Promise<any> {
  const updatedAuthor = await prisma.author.update({
    where: { id },
    data: { status: status },
  })

  // Fetch user information for email
  const user = await prisma.user.findUnique({
    where: { id: updatedAuthor.user_id },
  })

  if (user) {
    await sendAuthorStatusUpdateEmail(user, updatedAuthor)
  }

  return updatedAuthor
}

export async function deleteAuthor(id: number): Promise<any> {
  return await prisma.author.delete({
    where: { id },
  })
}
