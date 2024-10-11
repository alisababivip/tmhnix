import { handleController } from '~~/utils'
import { getTransaction, getTransactions } from './queries' // You will need to create these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query, ____, user) => {
    const { type, status, wallet, walletType, basic } = query

    return await getTransactions(
      user.id,
      type,
      status,
      wallet,
      walletType,
      basic,
    )
  }),

  show: handleController(async (_, __, params) => {
    return await getTransaction(params.referenceId)
  }),
}
