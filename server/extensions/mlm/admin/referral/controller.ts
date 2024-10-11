import { handleController } from '~~/utils'
import {
  getAllReferrals,
  getReferralById,
  getReferralStats,
  updateReferralStatus,
  getAllNodes,
  getNodeById,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return getAllReferrals()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getReferralById(id)
  }),

  nodes: handleController(async () => {
    return getAllNodes()
  }),

  node: handleController(async (_, __, params) => {
    const { uuid } = params
    return getNodeById(uuid)
  }),

  updateStatus: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { status } = body
    return updateReferralStatus(id, status)
  }),

  referralStats: handleController(async () => {
    return getReferralStats()
  }),
}
