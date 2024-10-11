import { handleController } from '~~/utils'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    return getCategories(query.posts)
  }),

  show: handleController(async (_, __, params, query) => {
    return getCategory(Number(params.id), query.posts)
  }),

  store: handleController(async (_, __, ___, ____, body) => {
    return createCategory(body.category)
  }),

  update: handleController(async (_, __, params, ____, body) => {
    return updateCategory(Number(params.id), body.category)
  }),

  delete: handleController(async (_, __, params) => {
    return deleteCategory(Number(params.id))
  }),
}
