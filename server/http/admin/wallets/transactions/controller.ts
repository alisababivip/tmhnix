import { handleController } from '~~/utils'
import { getAdminTransactions } from './queries' // You will need to create these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { user, type, status, wallet, walletType, basic } = query

    return await getAdminTransactions(
      user,
      type,
      status,
      wallet,
      walletType,
      basic,
    )
  }),
}
