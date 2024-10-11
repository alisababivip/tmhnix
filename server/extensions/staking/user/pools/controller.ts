import { handleController } from '~~/utils'
import { getPoolDetailsById, listActivePools } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listActivePools()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getPoolDetailsById(Number(id))
  }),
}
