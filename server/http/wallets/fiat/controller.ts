import { handleController } from '~~/utils'
import {
  customFiatDepositMethod,
  depositFiat,
  getDepositGateway,
  getDepositGateways,
  getDepositMethod,
  getDepositMethods,
  getWithdrawMethod,
  getWithdrawMethods,
  withdrawFiat,
} from './queries'

export const controllers = {
  depositMethods: handleController(async () => {
    return getDepositMethods()
  }),
  depositMethod: handleController(async (_, __, params) => {
    return getDepositMethod(params.id)
  }),
  depositGateways: handleController(async () => {
    return getDepositGateways()
  }),
  depositGateway: handleController(async (_, __, params) => {
    return getDepositGateway(params.id)
  }),
  withdrawMethods: handleController(async () => {
    return getWithdrawMethods()
  }),
  withdrawMethod: handleController(async (_, __, params) => {
    return getWithdrawMethod(params.id)
  }),
  deposit: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return depositFiat(user.id, body.transaction, body.currency)
  }),

  withdraw: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const response = withdrawFiat(
        user.id,
        body.wallet,
        body.methodId,
        body.amount,
        body.total,
        body.custom_data,
      )
      return {
        ...response,
        message: 'Withdrawal request sent successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  customDeposit: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    return customFiatDepositMethod(
      user.id,
      body.wallet,
      body.methodId,
      body.amount,
      body.total,
      body.custom_data,
    )
  }),
}
