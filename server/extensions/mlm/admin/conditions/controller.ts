import { handleController } from '~~/utils'
import {
  getReferralConditionById,
  listReferralConditions,
  updateReferralConditionById,
  updateReferralConditionStatus,
} from './queries' // Make sure to implement these functions in your queries file.

export const controllers = {
  index: handleController(async () => {
    return listReferralConditions()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getReferralConditionById(id)
  }),

  updateStatus: handleController(async (_, __, params, ___, body) => {
    const { id } = params
    const { status } = body
    return updateReferralConditionStatus(id, status)
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const { id } = params
    const { title, description, reward, reward_type, reward_currency } = body
    return updateReferralConditionById(
      id,
      title,
      description,
      reward,
      reward_type,
      reward_currency,
    )
  }),
}
