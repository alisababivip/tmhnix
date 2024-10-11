import { handleController } from '~~/utils'
import { deleteKyc, getKyc, getKycs, updateKycStatus } from './queries'

export const controllers = {
  index: handleController(async () => {
    return await getKycs()
  }),
  show: handleController(async (_, __, params) => {
    return await getKyc(Number(params.id))
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteKyc(Number(params.id))
      return {
        message: 'KYC application removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateKycStatus(
        Number(params.id),
        body.status,
        body.message,
      )
      return {
        ...response,
        message: 'KYC application updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
