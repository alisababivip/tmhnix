import { handleController } from '~~/utils'
import { getToken, getTokens } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getTokens()
  }),

  show: handleController(async (_, __, params) => {
    const { currency, chain } = params
    return await getToken(currency, chain)
  }),
}
