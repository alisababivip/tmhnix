import { handleController } from '~~/utils'
import { getActiveKycTemplate } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getActiveKycTemplate()
  }),
}
