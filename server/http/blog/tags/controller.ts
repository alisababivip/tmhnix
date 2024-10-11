import { handleController } from '~~/utils'
import { createTag, deleteTag, getTag, getTags, updateTag } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    return getTags(query.posts)
  }),

  show: handleController(async (_, __, params, query) => {
    return getTag(params.slug, query.posts)
  }),

  store: handleController(async (_, __, ___, ____, body) => {
    return createTag(body.tag)
  }),

  update: handleController(async (_, __, params, ____, body) => {
    return updateTag(Number(params.id), body.tag)
  }),

  delete: handleController(async (_, __, params) => {
    return deleteTag(Number(params.id))
  }),
}
