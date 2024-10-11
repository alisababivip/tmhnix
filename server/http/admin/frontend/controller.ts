import { cacheFrontendSections } from '~~/http/frontend/controller'
import { handleController } from '~~/utils'
import {
  getFrontendSection,
  getFrontendSections,
  updateFrontendSection,
  updateFrontendSectionStatus,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getFrontendSections()
  }),
  show: handleController(async (_, __, params) => {
    return getFrontendSection(Number(params.id))
  }),
  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateFrontendSection(
        Number(params.id),
        body.section,
      )
      await cacheFrontendSections()
      return {
        ...response,
        message: 'Frontend section updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateFrontendSectionStatus(body.ids, body.status)
      await cacheFrontendSections()
      return {
        message: 'Frontend section status updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
