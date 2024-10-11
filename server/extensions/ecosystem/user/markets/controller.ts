import { handleController } from '../../../../utils'
import { getMarket, getMarkets } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getMarkets()
  }),

  show: handleController(async (_, __, params) => {
    return await getMarket(Number(params.id))
  }),
}
