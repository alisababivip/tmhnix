import { handleController } from '~~/utils'
import { getLedgers } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('Unauthorized')
    return await getLedgers()
  }),
}
