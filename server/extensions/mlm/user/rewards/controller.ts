import { handleController } from '~~/utils'
import { claimReward, listMyRewards } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return listMyRewards(user.id)
  }),

  claim: handleController(async (_, __, params, ___, ____, user) => {
    const { uuid } = params
    return claimReward(user.id, uuid)
  }),
}
