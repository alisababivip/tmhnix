import { handleController } from '~~/utils'
import {
  createKycTemplate,
  deleteKycTemplate,
  getKycTemplate,
  getKycTemplates,
  updateKycTemplate,
  updateKycTemplateStatus,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getKycTemplates()
  }),
  show: handleController(async (_, __, params) => {
    return await getKycTemplate(Number(params.id))
  }),
  store: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await createKycTemplate(body.data)
      return {
        ...response,
        message: 'KYC template created successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateKycTemplate(Number(params.id), body.data)
      return {
        ...response,
        message: 'KYC template updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteKycTemplate(Number(params.id))
      return {
        message: 'KYC template deleted successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateKycTemplateStatus(body.ids, body.status)
      return {
        message: 'KYC template status updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
