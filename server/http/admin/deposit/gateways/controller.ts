import { handleController } from '~~/utils'
import { updateDepositGateway, updateDepositGatewayStatus } from './queries'

export const controllers = {
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateDepositGateway(Number(params.id), body.data)
      return {
        ...response,
        message: 'Deposit gateway updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      const { ids, status } = body
      await updateDepositGatewayStatus(ids, status)
      return {
        message: 'Deposit gateways updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
