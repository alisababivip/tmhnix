import { handleController } from '~~/utils'
import { getLogById, listLogs } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listLogs()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getLogById(Number(id))
  }),
}
