import { handleController } from '~~/utils'
import { createWatchlist, deleteWatchlist, getWatchlists } from './queries' // Make sure these functions exist in your queries file

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) {
      throw new Error('User not found')
    }
    return getWatchlists(user.id)
  }),
  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) {
      throw new Error('User not found')
    }
    return createWatchlist(user.id, body.symbol, body.type)
  }),
  delete: handleController(async (_, __, params) => {
    return deleteWatchlist(Number(params.id))
  }),
}
