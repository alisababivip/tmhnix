import { handleController } from '~~/utils'
import {
  createNotification,
  deleteNotification,
  getNotifications,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return await getNotifications(user.id)
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return await createNotification(user.id, body.notification)
  }),

  delete: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return await deleteNotification(user.id, Number(params.id))
  }),
}
