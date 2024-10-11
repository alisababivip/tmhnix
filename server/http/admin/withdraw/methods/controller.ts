import { handleController } from '~~/utils'
import {
  createWithdrawMethod,
  deleteWithdrawMethod,
  updateWithdrawMethod,
  updateWithdrawMethodStatus,
} from './queries'

export const controllers = {
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const wallet = await createWithdrawMethod(body.data)
      return {
        ...wallet,
        message: 'Withraw method created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const wallet = updateWithdrawMethod(Number(params.id), body.data)
      return {
        ...wallet,
        message: 'Withraw method updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteWithdrawMethod(Number(params.id))
      return {
        message: 'Withraw method deleted successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateWithdrawMethodStatus(body.ids, body.status)
      return {
        message: 'Withraw method status updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
