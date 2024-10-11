import { handleController } from '~~/utils'
import { getOrder, getOrders } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { user, type, status, side, currency } = query
    return await getOrders(user, type, status, side, currency)
  }),
  show: handleController(async (_, __, params, query) => {
    const { type } = query
    const { uuid } = params
    return await getOrder(uuid, type)
  }),
}
