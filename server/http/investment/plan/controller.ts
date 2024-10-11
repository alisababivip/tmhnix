import { handleController } from '~~/utils'
import { getPlan, getPlans } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getPlans()
  }),
  show: handleController(async (_, __, params) => {
    return await getPlan(Number(params.id))
  }),
}
