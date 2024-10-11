import { handleController } from '~~/utils'
import {
  createAuthor,
  deleteAuthor,
  getAuthor,
  getAuthors,
  updateAuthor,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    return getAuthors(query.posts, query.status)
  }),

  show: handleController(async (_, __, params, query) => {
    return getAuthor(Number(params.id), query.posts)
  }),

  store: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return createAuthor(user.id)
  }),

  update: handleController(async (_, __, params, ___, body) => {
    return updateAuthor(Number(params.id), body.status)
  }),

  delete: handleController(async (_, __, params) => {
    return deleteAuthor(Number(params.id))
  }),
}
