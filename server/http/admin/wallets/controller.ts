import { getUserById } from '~~/http/auth/queries'
import { getCurrency, getWalletQuery } from '~~/http/wallets/spot/queries'
import { createLogger } from '~~/logger'
import type { Transaction, User, Wallet } from '~~/types'
import { TransactionStatus } from '~~/types'
import { handleController } from '~~/utils'
import {
  sendSpotWalletWithdrawalConfirmationEmail,
  sendTransactionStatusUpdateEmail,
} from '~~/utils/emails'
import prisma from '~~/utils/prisma'
import ExchangeManager from '../../../utils/exchange'
import {
  getWallet,
  getWallets,
  updateTransactionStatusQuery,
  updateUserWalletBalance,
  updateWalletBalance,
} from './queries'

const logger = createLogger('Spot Wallets')

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { filter, perPage, page, user, type, hideSmallBalances } = query
    const perPageNumber = perPage ? parseInt(perPage, 10) : 10
    const pageNumber = page ? parseInt(page, 10) : 1
    return getWallets(
      filter,
      perPageNumber,
      pageNumber,
      user,
      type,
      hideSmallBalances === 'true',
    )
  }),
  show: handleController(async (_, __, params) => {
    return getWallet(params.uuid)
  }),
  updateBalance: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await updateWalletBalance(
        body.uuid,
        body.type,
        body.amount,
      )
      return {
        ...response,
        message: 'Wallet balance updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateTransactionStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await updateTransactionStatusQuery(
        body.referenceId,
        body.status,
        body.message,
      )
      return {
        ...response,
        message: 'Transaction status updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  approveSpotWalletWithdrawal: handleController(async (_, __, params) => {
    const { uuid } = params
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { uuid },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not pending')
      }

      const { amount, user_id } = transaction
      const { currency, chain, address, memo } = transaction.metadata as any

      // Fetch the user's wallet
      const wallet = (await getWalletQuery(
        user_id,
        currency,
      )) as unknown as Wallet
      if (!wallet) {
        throw new Error('Wallet not found')
      }

      const currencyData = await getCurrency(currency)
      if (!currencyData) {
        throw new Error('Currency not found')
      }

      const fee =
        currencyData.chains?.find((c) => c.network === chain)?.withdrawFee || 0

      const withdrawAmount = Number(amount) + Number(fee)

      if (withdrawAmount > wallet.balance) {
        throw new Error(
          'Your withdraw amount including fees is higher than your balance',
        )
      }

      // Initialize exchange
      const exchange = await (ExchangeManager as any).startExchange()
      const provider = await (ExchangeManager as any).provider

      // Implement your third-party API logic here
      let withdrawResponse, withdrawStatus
      switch (provider) {
        case 'kucoin':
          try {
            const transferProcess = await exchange.transfer(
              currency,
              withdrawAmount,
              'main',
              'trade',
            )
            if (transferProcess.id) {
              try {
                withdrawResponse = await exchange.withdraw(
                  currency,
                  withdrawAmount,
                  address,
                  memo,
                  { network: chain },
                )

                if (withdrawResponse.id) {
                  try {
                    const withdrawals =
                      await exchange.fetchWithdrawals(currency)
                    const withdrawData = withdrawals.find(
                      (w) => w.id === withdrawResponse.id,
                    )
                    if (withdrawData) {
                      withdrawResponse.fee =
                        withdrawAmount * fee + withdrawData.fee?.cost
                      switch (withdrawData.status) {
                        case 'ok':
                          withdrawStatus = TransactionStatus.COMPLETED
                          break
                        case 'canceled':
                          withdrawStatus = TransactionStatus.CANCELLED
                          break
                        case 'failed':
                          withdrawStatus = TransactionStatus.FAILED
                        default:
                          withdrawStatus = TransactionStatus.PENDING
                          break
                      }
                    }
                  } catch (error) {
                    withdrawResponse.fee = fee
                  }
                }
              } catch (error) {
                logger.error(`Withdrawal failed: ${error.message}`)
                throw new Error(`Withdrawal failed: ${error.message}`)
              }
            }
          } catch (error) {
            logger.error(`Transfer failed: ${error.message}`)
            throw new Error(`Transfer failed: ${error.message}`)
          }
          break
        case 'binance':
          try {
            withdrawResponse = await exchange.withdraw(
              currency,
              withdrawAmount,
              address,
              memo,
              { network: chain },
            )

            withdrawResponse.fee = Number(withdrawResponse.fee) || fee
            switch (withdrawResponse.status) {
              case 'ok':
                withdrawStatus = TransactionStatus.COMPLETED
                break
              case 'canceled':
                withdrawStatus = TransactionStatus.CANCELLED
                break
              case 'failed':
                withdrawStatus = TransactionStatus.FAILED
              default:
                withdrawStatus = TransactionStatus.PENDING
                break
            }
          } catch (error) {
            logger.error(`Withdrawal failed: ${error.message}`)
            throw new Error(`Withdrawal failed: ${error.message}`)
          }
          break
        // other providers
        default:
          break
      }

      if (
        !withdrawResponse ||
        !withdrawResponse.id ||
        !withdrawStatus ||
        withdrawStatus === TransactionStatus.FAILED ||
        withdrawStatus === TransactionStatus.CANCELLED
      ) {
        throw new Error('Withdrawal failed')
      }

      const updatedTransaction = (await prisma.transaction.update({
        where: {
          uuid,
        },
        data: {
          status: withdrawStatus,
          reference_id: withdrawResponse.id,
        },
      })) as unknown as Transaction

      try {
        const userData = (await getUserById(user_id)) as unknown as User
        sendSpotWalletWithdrawalConfirmationEmail(
          userData,
          updatedTransaction,
          wallet,
        )
      } catch (error) {
        logger.error(`Withdrawal confirmation email failed: ${error.message}`)
      }

      return {
        message: 'Withdrawal approved successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),

  rejectSpotWalletWithdrawal: handleController(
    async (_, __, params, ___, body) => {
      const { uuid } = params
      const { message } = body
      try {
        const transaction = (await prisma.transaction.findUnique({
          where: { uuid },
        })) as unknown as Transaction

        if (!transaction) {
          throw new Error('Transaction not found')
        }

        if (transaction.status !== 'PENDING') {
          throw new Error('Transaction is not pending')
        }

        const { wallet_id } = transaction

        const updatedTransaction = (await prisma.transaction.update({
          where: {
            uuid,
          },
          data: {
            status: TransactionStatus.REJECTED,
            metadata: {
              ...transaction.metadata,
              note: message || 'Withdrawal request rejected',
            },
          },
        })) as unknown as Transaction

        const updatedWallet = (await updateUserWalletBalance(
          wallet_id,
          Number(updatedTransaction.amount),
          Number(updatedTransaction.fee),
          'REFUND_WITHDRAWAL',
        )) as unknown as Wallet

        try {
          const user = await prisma.user.findUnique({
            where: { id: transaction.user_id },
          })

          await sendTransactionStatusUpdateEmail(
            user,
            updatedTransaction,
            updatedWallet,
            updatedWallet.balance,
            updatedTransaction.metadata?.note || 'Withdrawal request rejected',
          )
        } catch (error) {
          console.error(error)
        }

        return {
          message: 'Withdrawal rejected successfully',
        }
      } catch (error) {
        throw new Error(error.message)
      }
    },
  ),
}
