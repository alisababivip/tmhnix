import { handleController } from '~~/utils'
import {
  createDepositMethod,
  deleteDepositMethod,
  updateDepositMethod,
  updateDepositMethodStatus,
} from './queries'

export const controllers = {
  store: handleController(async (_, __, ___, ____, body) => {
    return createDepositMethod(body.data)
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateDepositMethod(Number(params.id), body.data)
      return {
        ...response,
        message: 'Deposit method updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteDepositMethod(Number(params.id))
      return {
        message: 'Deposit method removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateDepositMethodStatus(body.ids, body.status)
      return {
        message: 'Deposit methods updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
