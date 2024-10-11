import { handleController } from '~~/utils'
import {
  createWallet,
  fetchWallet,
  fetchWalletsByType,
  getTransactions,
  getWallet,
  getWallets,
  transferFunds,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query, _____, user) => {
    const { transactions } = query
    return await getWallets(user.id, transactions === 'true')
  }),

  show: handleController(async (_, __, ___, query, ____, user) => {
    return await getWallet(query.uuid)
  }),

  fetch: handleController(async (_, __, ___, query, ____, user) => {
    const { currency, type } = query
    return await fetchWallet(user.id, currency, type)
  }),

  fetchType: handleController(async (_, __, ___, query, ____, user) => {
    const { type, transactions } = query
    return await fetchWalletsByType(user.id, type, transactions === 'true')
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    const wallet = await createWallet(user.id, body.currency, body.type)
    return {
      message: 'Wallet created successfully',
      wallet,
    }
  }),

  balance: handleController(async (_, __, ___, query) => {
    return await getWallet(query.uuid)
  }),

  transactions: handleController(async (_, __, ___, query) => {
    return await getTransactions(query.uuid)
  }),

  transfer: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    const { currency, type, amount, to } = body
    return await transferFunds(user.id, currency, type, amount, to)
  }),
}
