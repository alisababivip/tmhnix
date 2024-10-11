import type { Post, PostStatus } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getPosts(
  uuid?: string,
  categoryName?: string,
  tagName?: string,
  status?: string,
): Promise<Post[] | Error> {
  // @ts-ignore
  const where: any = {}
  if (uuid) {
    const user = await prisma.user.findUnique({ where: { uuid: uuid } })
    if (!user) {
      throw new Error('User not found.')
    }

    const author = await prisma.author.findUnique({
      where: { user_id: user.id },
    })
    if (!author) {
      throw new Error('Author not found.')
    }

    where.author_id = author.id
  }

  if (categoryName) {
    const category = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    })
    if (!category) {
      throw new Error('Category not found.')
    }
    where.category_id = category.id
  }

  if (status) {
    where.status = status
  }

  if (tagName) {
    const tag = await prisma.tag.findFirst({
      where: {
        name: tagName,
      },
    })
    if (!tag) {
      throw new Error('Tag not found.')
    }
    where.post_tag = {
      some: {
        tag_id: tag.id,
      },
    }
  }

  return (await prisma.post.findMany({
    where,
    include: {
      author: {
        include: {
          user: {
            select: {
              id: true,
              uuid: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
      category: true, // Include category details.
      post_tag: {
        include: {
          tag: true, // Include tag details in the post_tag pivot records.
        },
      },
    },
  })) as unknown as Post[]
}

export async function getPost(id: number): Promise<any | null> {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: true, // Include author details.
      category: true, // Include category details.
      post_tag: {
        include: {
          tag: true, // Include tag details in the post_tag pivot records.
        },
      },
    },
  })
}

export async function createPost(userId: number, data: any): Promise<any> {
  try {
    const author = await prisma.author.findUnique({
      where: { user_id: userId },
    })
    if (!author) {
      throw new Error('Author not found.')
    }

    // Destructure and prepare data
    const { tags, title, category, ...postData } = data
    const slug = await createSlug(title)

    // Create post using Prisma transaction
    const createPostTransaction = prisma.$transaction([
      prisma.post.create({
        data: {
          ...postData,
          title,
          slug,
          author: {
            connect: { id: author.id },
          },
          category: {
            connect: { id: category },
          },
          post_tag: {
            create: tags.map((tagId: string) => ({ tag_id: tagId })),
          },
        },
      }),
    ])

    const [newPost] = await createPostTransaction
    return newPost
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

async function createSlug(title: string): Promise<string> {
  // Replace non-word characters with dashes, convert to lowercase, and trim dashes from start/end
  let slug = title
    .replace(/\W+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')

  // Check if a post with this slug already exists
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  })

  // If a post with this slug exists, append the current date to the end
  if (existingPost) {
    const date = new Date()
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`
    slug = `${slug}-${dateString}`
  }

  return slug
}

export async function updatePost(
  userId: number,
  slug: string,
  data: any,
): Promise<any> {
  // Find author by user ID
  const author = await prisma.author.findUnique({
    where: { user_id: userId },
  })
  if (!author) {
    return new Error('Author not found.')
  }

  const { tags, category, ...postData } = data

  // Check if the post exists
  const existingPost = await prisma.post.findUnique({
    where: { slug: slug },
  })
  if (!existingPost) {
    return new Error('Post not found.')
  }

  // Update the post
  return await prisma.post.update({
    where: { slug: slug },
    data: {
      ...postData,
      author: {
        connect: { id: author.id },
      },
      category: {
        connect: { id: category },
      },
      post_tag: {
        // Delete all existing tags for this post
        deleteMany: {},
        // Create the new tags
        create: tags.map((tagId) => ({ tag_id: tagId })),
      },
    },
  })
}

export async function updatePostStatus(
  id: number,
  status: PostStatus,
): Promise<any> {
  return await prisma.post.update({
    where: { id },
    data: { status },
  })
}

export async function deletePost(userId: number, id: number): Promise<any> {
  const author = await prisma.author.findUnique({
    where: { user_id: userId },
  })

  if (!author) {
    throw new Error('Author not found.')
  }

  return await prisma.post.delete({
    where: { id: id, author_id: author.id },
  })
}
