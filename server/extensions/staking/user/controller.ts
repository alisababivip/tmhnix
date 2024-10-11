import { createLogger } from '../../../logger'
import { handleController } from '../../../utils'
import {
  getStakeById,
  listUserStakes,
  processStakingLogs,
  stakeTokens,
  withdrawStake,
} from './queries'
const logger = createLogger('Staking')

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return listUserStakes(user.id)
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    const { id } = params
    return getStakeById(user.id, Number(id))
  }),

  stake: handleController(async (_, __, ___, ____, body, user) => {
    const { pool_id, amount, duration_id } = body
    return stakeTokens(
      user.id,
      Number(pool_id),
      Number(amount),
      Number(duration_id),
    )
  }),

  withdraw: handleController(async (_, __, ___, ____, body, user) => {
    const { stake_id } = body
    return withdrawStake(user.id, Number(stake_id))
  }),

  cron: handleController(async () => {
    try {
      await processStakingLogs()
    } catch (error) {
      throw new Error(error)
    }
  }),
}
