import { handleController } from '~~/utils'
import {
  getDurations,
  getDuration,
  createDuration,
  deleteDuration,
  updateDuration,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return getDurations()
  }),
  show: handleController(async (_, __, params) => {
    const { id } = params
    return getDuration(Number(id))
  }),
  create: handleController(async (_, __, ___, ____, body) => {
    const { pool_id, duration, interest_rate } = body
    return createDuration(
      Number(pool_id),
      Number(duration),
      Number(interest_rate),
    )
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { duration, interest_rate } = body
    return updateDuration(Number(id), Number(duration), Number(interest_rate))
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteDuration(Number(id))
  }),
}
