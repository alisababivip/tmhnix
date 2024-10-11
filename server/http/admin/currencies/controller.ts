import { cacheCurrencies } from '~~/http/currencies/controller'
import { handleController } from '~~/utils'
import { getAllCurrencies, updateCurrency } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getAllCurrencies()
  }),

  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      const { ids, status } = body
      await updateCurrency(ids, status)
      await cacheCurrencies()
      return {
        message: 'Currencies updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
