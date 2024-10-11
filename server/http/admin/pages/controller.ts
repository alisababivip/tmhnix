import { cachePages } from '~~/http/pages/controller'
import { handleController } from '~~/utils'
import { createPage, deletePage, updatePage } from './queries'

export const controllers = {
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await createPage(body.data)
      await cachePages()
      return {
        ...response,
        message: 'Page created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updatePage(Number(params.id), body.data)
      await cachePages()
      return {
        ...response,
        message: 'Page updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deletePage(Number(params.id))
      await cachePages()
      return {
        message: 'Page removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
