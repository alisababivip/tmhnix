import type { Page } from '~~/types' // Import your own types

import prisma from '~~/utils/prisma'

export async function createPage(data: Page): Promise<any> {
  // Initial slug generation based on the title
  let slug = data.title.toLowerCase().replace(/\s+/g, '-')

  // Initialize a variable to keep track of how many times this slug has been used
  let slugCount = 0

  // Check if the generated slug already exists
  const existingPage = await prisma.page.findFirst({
    where: {
      slug: {
        startsWith: slug,
      },
    },
    orderBy: {
      slug: 'desc',
    },
    select: {
      slug: true,
    },
  })

  if (existingPage) {
    const match = existingPage.slug.match(/-(\d+)$/)
    slugCount = match ? parseInt(match[1], 10) : 0
    slugCount++
  }

  // If slug exists, append a number to make it unique
  if (slugCount > 0) {
    slug = `${slug}-${slugCount}`
  }

  return await prisma.page.create({
    data: {
      title: data.title,
      slug: slug,
      description: data.description,
      content: data.content,
      image: data.image,
      status: data.status,
    },
  })
}

export async function updatePage(
  id: number,
  data: Partial<Page>,
): Promise<any> {
  return await prisma.page.update({
    where: { id: id },
    data,
  })
}

export async function deletePage(id: number): Promise<any> {
  return await prisma.page.delete({
    where: { id: id },
  })
}
