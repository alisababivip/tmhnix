import { handleController } from '~~/utils'
import { getMessages, sendMessage } from './queries'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    return getMessages(query.ticket)
  }),

  send: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return sendMessage(user.id, body.ticket, body.message, body.isSupport)
  }),

  getMetadata: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await fetch(body.url, {
        mode: 'cors',
      })

      const html = await response.text()

      const dom = new JSDOM(html)
      const document = dom.window.document

      const title = document.querySelector('head > title')?.textContent
      const descriptionElement =
        document.querySelector('meta[name="description"]') ||
        document.querySelector('meta[property="og:description"]')
      const description = descriptionElement
        ? descriptionElement.getAttribute('content')
        : 'No description available'

      const imageElement = document.querySelector('meta[property="og:image"]')
      let image = imageElement ? imageElement.getAttribute('content') : null

      if (!image) {
        const faviconElement =
          document.querySelector('link[rel="shortcut icon"]') ||
          document.querySelector('link[rel="icon"]')
        image = faviconElement ? faviconElement.getAttribute('href') : null

        if (image && !image.startsWith('http')) {
          const parsedUrl = new URL(body.url)
          image = parsedUrl.origin + image
        }
      }

      if (!image) {
        image = '/img/placeholder.png'
      }

      return { title, description, image }
    } catch (error) {
      throw new Error('Error fetching metadata')
    }
  }),
}
