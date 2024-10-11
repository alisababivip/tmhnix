import { handleController } from '~~/utils'
import { createKyc, getKyc, updateKyc } from './queries' // Make sure these functions exist in your queries file

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return getKyc(user.id)
  }),
  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return createKyc(user.id, body.templateId, body.template, body.level)
  }),
  update: handleController(async (_, __, params, ____, body) => {
    return updateKyc(Number(params.id), body.updatedData)
  }),
}
