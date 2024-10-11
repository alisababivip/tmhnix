import { handleController } from '~~/utils'
import { getAnalyticsPerDay, listMyReferrals, listReferrals } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return listMyReferrals(user.id)
  }),

  list: handleController(async (_, __, ___, ____, _____, user) => {
    return listReferrals(user.id)
  }),

  analytics: handleController(async (_, __, ___, ____, _____, user) => {
    return await getAnalyticsPerDay(user.id)
  }),
}
