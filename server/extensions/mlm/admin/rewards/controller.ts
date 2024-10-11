import { handleController } from '~~/utils'
import { deleteRewardCondition, listAllRewards, showReward } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listAllRewards()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return await showReward(Number(id))
  }),

  update: handleController(async (_, __, params, ____, body) => {}),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteRewardCondition(Number(id))
  }),
}
