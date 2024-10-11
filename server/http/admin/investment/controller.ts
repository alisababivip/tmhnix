import { handleController } from '~~/utils'
import {
  createPlan,
  deletePlan,
  getPlan,
  getPlans,
  updatePlan,
  updatePlanStatus,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getPlans()
  }),
  show: handleController(async (_, __, params) => {
    return await getPlan(Number(params.id))
  }),
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await createPlan(body.plan)
      return {
        ...response,
        message: 'Investment plan created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updatePlan(Number(params.id), body.plan)
      return {
        ...response,
        message: 'Investment plan updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await await deletePlan(Number(params.id))
      return {
        message: 'Investment plan removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updatePlanStatus(body.ids, body.status)
      return {
        message: 'Investment plan updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
