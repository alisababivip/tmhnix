import { handleController } from '~~/utils'
import {
  createPool,
  deletePool,
  getPoolById,
  listPools,
  updatePool,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listPools()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getPoolById(Number(id))
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const {
      name,
      currency,
      chain,
      type,
      min_stake,
      max_stake,
      status,
      description,
    } = body
    return createPool(
      name,
      currency,
      chain,
      type,
      Number(min_stake),
      Number(max_stake),
      status,
      description,
    )
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const {
      name,
      currency,
      chain,
      type,
      min_stake,
      max_stake,
      status,
      description,
    } = body
    return updatePool(
      Number(id),
      name,
      currency,
      chain,
      type,
      Number(min_stake),
      Number(max_stake),
      status,
      description,
    )
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deletePool(Number(id))
  }),
}
