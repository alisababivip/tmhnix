import fs from 'fs/promises'
import path from 'path'
import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import { getFrontendSections } from './queries'

export async function cacheFrontendSections() {
  const frontendSections = await getFrontendSections()
  await redis.set(
    'frontendSections',
    JSON.stringify(frontendSections),
    'EX',
    43200,
  ) // Cache for 12 hours
}

cacheFrontendSections()

const getHtmlContent = async (url) => {
  const filePath = path.join(process.cwd(), '.app', 'public', url)
  try {
    const htmlContent = await fs.readFile(filePath, 'utf-8')
    return htmlContent
  } catch (error) {
    console.error('Error reading HTML file:', error)
    throw new Error('Failed to read HTML content')
  }
}

export const controllers = {
  index: handleController(async () => {
    try {
      const cachedFrontendSections = await redis.get('frontendSections')
      if (cachedFrontendSections) return JSON.parse(cachedFrontendSections)
    } catch (err) {
      console.error('Redis error:', err)
    }
    return await getFrontendSections()
  }),
  html: handleController(async (_, __, ___, query) => {
    const { path: pathQuery } = query
    return await getHtmlContent(pathQuery)
  }),
}
