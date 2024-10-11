import type { Transaction, User, Wallet } from '../../../types'
import { TransactionStatus, TransactionType } from '../../../types'
import { handleController } from '../../../utils'
import {
  createTransaction,
  createWalletQuery,
  deleteTransaction,
  getCurrency,
  getPendingTransactionsQuery,
  getTransactionQuery,
  getWalletQuery,
  transactionExistsQuery,
  updateTransaction,
  updateWalletBalance,
  walletExistsQuery,
} from './queries'

import { processRewards } from '~~/utils/affiliate'
import { createLogger } from '../../../logger'
import {
  sendSpotWalletDepositConfirmationEmail,
  sendSpotWalletWithdrawalConfirmationEmail,
} from '../../../utils/emails'
import ExchangeManager from '../../../utils/exchange'
import { getUserById } from '../../auth/queries'
import { getSettings } from '../../settings/queries'
const logger = createLogger('Spot Wallets')
const verificationIntervals: Map<number, NodeJS.Timeout> = new Map()

export const controllers = {
  index: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    return getWalletQuery(user.id, params.currency)
  }),

  store: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')

    const walletExists = await walletExistsQuery(user.id, params.currency)

    if (walletExists) {
      throw new Error('Wallet already exists')
    }

    // Generate wallet address
    let addresses
    try {
      addresses = await generateWalletAddressQuery(params.currency)
    } catch (error) {
      logger.error(`Failed to generate wallet address: ${error.message}`)
      throw new Error(
        'Failed to generate wallet address, please contact support',
      )
    }

    if (!addresses || !Object.keys(addresses).length) {
      logger.error(`Failed to generate wallet address`, addresses)
      throw new Error('Failed to generate wallet address, please try again')
    }

    return createWalletQuery(user.id, params.currency, addresses)
  }),

  transactions: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    return getTransactionQuery(user.id, params.trx)
  }),

  deposit: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')

    const transactionExist = await transactionExistsQuery(body.trx)
    if (transactionExist) {
      throw new Error('Transaction already exists')
    }

    const transaction = await createTransaction(user.id, {
      wallet_id: body.wallet_id,
      reference_id: body.trx,
      amount: 0,
      metadata: {
        chain: body.chain,
      },
      type: 'DEPOSIT',
    })

    if (!transaction) {
      throw new Error('Transaction not created')
    }

    // Start the verification schedule for this transaction
    startVerificationSchedule(Number(transaction.id), user.id, body.trx)
    return transaction
  }),

  depositVerify: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    return verifyTransaction(user.id, params.trx)
  }),

  depositCancel: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')

    // Find third-party transaction by transaction ID
    const transaction = await getTransactionQuery(user.id, params.trx)

    // Return error response if transaction not found
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status === TransactionStatus.CANCELLED) {
      // Stop the verification schedule for this transaction
      stopVerificationSchedule(Number(transaction.id))

      throw new Error('Transaction already cancelled')
    }

    const updatedTransaction = await updateTransaction(
      transaction.id,
      TransactionStatus.CANCELLED,
    )

    return updatedTransaction
  }),

  withdraw: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')

    // Validate required fields
    const { amount, address, currency, chain, memo } = body
    if (!amount || !address || !currency) {
      throw new Error('Invalid input')
    }

    // Fetch the user's wallet
    const wallet = await getWalletQuery(user.id, currency)
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

    const settings = await getSettings()
    const settingsObject = Object.fromEntries(
      settings.map((s) => [s.key, s.value]),
    )

    // Check withdrawal setting
    let updatedWallet, transaction, message
    if (settingsObject['spot_wallet_withdrawal'] === 'Manual') {
      updatedWallet = (await updateWalletBalance(
        user.id,
        currency,
        Number(amount),
        Number(fee),
        'WITHDRAWAL',
      )) as unknown as Wallet

      if (!updatedWallet) {
        throw new Error('Wallet not updated')
      }

      // Implement your transaction and notification logic here
      transaction = (await createTransaction(user.id, {
        wallet_id: wallet.id,
        amount: Number(amount),
        fee: parseFloat(fee),
        metadata: {
          address: address,
          currency: currency,
          chain: chain,
          memo: memo,
        },
        description: `Withdrawl of ${amount} ${currency} to ${address}`,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
      })) as unknown as Transaction

      if (!transaction) {
        throw new Error('Transaction not created')
      }

      message = 'Withdrawal request received. It will be processed manually.'
    } else {
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
                throw new Error('Withdrawal failed')
              }
            }
          } catch (error) {
            logger.error(`Transfer failed: ${error.message}`)
            throw new Error('Transfer failed')
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
            throw new Error('Withdrawal failed')
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

      // Update wallet balance
      updatedWallet = (await updateWalletBalance(
        user.id,
        currency,
        Number(amount),
        Number(withdrawResponse.fee),
        'WITHDRAWAL',
      )) as unknown as Wallet

      if (!updatedWallet) {
        throw new Error('Wallet not updated')
      }

      // Implement your transaction and notification logic here
      transaction = (await createTransaction(user.id, {
        wallet_id: wallet.id,
        reference_id: withdrawResponse.id,
        amount: Number(amount),
        fee: parseFloat(withdrawResponse.fee),
        metadata: {
          address: address,
          currency: currency,
          chain: chain,
          memo: memo,
        },
        type: TransactionType.WITHDRAW,
        status: withdrawStatus,
      })) as unknown as Transaction

      if (!transaction) {
        throw new Error('Transaction not created')
      }

      try {
        const userData = (await getUserById(user.id)) as unknown as User
        sendSpotWalletWithdrawalConfirmationEmail(
          userData,
          transaction,
          updatedWallet,
        )
      } catch (error) {
        logger.error(`Withdrawal confirmation email failed: ${error.message}`)
      }

      message = 'Withdraw request placed successfully'
    }

    return {
      message: message,
      transaction: transaction,
      wallet: updatedWallet,
    }
  }),

  depositCron: handleController(async () => {
    try {
      await processPendingDeposits()
      return {
        message: 'Deposit cron executed successfully.',
      }
    } catch (error) {
      throw new Error(error)
    }
  }),

  withdrawCron: handleController(async () => {
    try {
      await processPendingWithdrawals()
    } catch (error) {
      throw new Error(error)
    }
  }),
}

export async function processPendingDeposits() {
  const transactions = await getPendingTransactionsQuery(
    TransactionType.DEPOSIT,
  )

  for (const transaction of transactions) {
    const transactionId = Number(transaction.id) // Convert to number as your map keys are numbers
    const userId = transaction.user_id
    const trx = transaction.reference_id

    // Only start a new verification schedule if it's not already running
    if (!verificationIntervals.has(transactionId)) {
      startVerificationSchedule(transactionId, userId, trx)
    }
  }
}

export async function processPendingWithdrawals() {
  const transactions = await getPendingTransactionsQuery(
    TransactionType.WITHDRAW,
  )

  for (const transaction of transactions) {
    const userId = transaction.user_id
    const trx = transaction.reference_id
    if (!trx) return

    const exchange = await (ExchangeManager as any).startExchange()
    try {
      const withdrawals = await exchange.fetchWithdrawals(
        transaction.wallet?.currency,
      )
      const withdrawData = withdrawals.find((w) => w.id === trx)
      let withdrawStatus: any
      if (withdrawData) {
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
      if (!withdrawStatus) {
        return
      }
      if (transaction.status === withdrawStatus) {
        return
      }
      await updateTransaction(transaction.id, withdrawStatus)
      if (
        withdrawStatus === TransactionStatus.FAILED ||
        withdrawStatus === TransactionStatus.CANCELLED
      ) {
        await updateWalletBalance(
          userId,
          transaction.wallet?.currency,
          Number(transaction.amount),
          Number(transaction.fee),
          'REFUND_WITHDRAWAL',
        )
      }
    } catch (error) {
      logger.error(`Withdrawal failed: ${error.message}`)
      return
    }
  }
}

export async function verifyTransaction(userId: number, trx: string) {
  const transaction = (await getTransactionQuery(
    userId,
    trx,
  )) as unknown as Transaction

  // Return error response if transaction not found
  if (!transaction) {
    throw new Error('Transaction not found')
  }

  if (transaction.status === TransactionStatus.COMPLETED) {
    stopVerificationSchedule(Number(transaction.id))
    return
  }

  // Initialize exchange
  const exchange = await (ExchangeManager as any).startExchange()
  const provider = await (ExchangeManager as any).provider

  let deposits: any[] = [] // Initialize to an empty array
  try {
    switch (provider) {
      case 'kucoin':
      case 'binance':
      case 'bitget':
        deposits = await exchange.fetch_deposits(transaction.wallet?.currency)
        break
      case 'coinbasepro':
        deposits = await exchange.fetch_transactions()
        break
    }
  } catch (error) {
    console.error('Error fetching deposits or transactions:', error)
    return // Exit the function if we can't fetch deposits
  }

  // Now, deposits is guaranteed to be an array (possibly empty)
  const deposit = deposits.find((d) => d.txid === transaction.reference_id)

  if (!deposit) {
    return
  }

  if (deposit.status !== 'ok') {
    return
  }

  const amount = deposit.amount
  const fee = deposit.fee?.cost || 0

  if (provider === 'kucoin' || provider === 'binance') {
    if (transaction.wallet?.currency !== deposit.currency) {
      stopVerificationSchedule(transaction.id)
      await deleteTransaction(transaction.id)
      return
    }
  }

  if (
    (transaction.status as TransactionStatus) === TransactionStatus.COMPLETED
  ) {
    stopVerificationSchedule(Number(transaction.id))
    return
  }

  const settings = await getSettings()

  const settingsObject = Object.fromEntries(
    settings.map((s) => [s.key, s.value]),
  )

  if (
    settingsObject['deposit_expiration'] &&
    settingsObject['deposit_expiration'] === 'Enabled'
  ) {
    const createdAt = deposit.timestamp / 1000
    const transactionCreatedAt =
      new Date(transaction.created_at).getTime() / 1000
    const currentTime = Date.now() / 1000
    const timeDiff = (currentTime - createdAt) / 60 // Difference in minutes

    if (
      createdAt < transactionCreatedAt - 900 ||
      createdAt > transactionCreatedAt + 900 ||
      timeDiff > 45
    ) {
      stopVerificationSchedule(transaction.id)
      await updateTransaction(transaction.id, TransactionStatus.TIMEOUT, {
        amount: amount,
      })
      return
    }
  }

  // update the amount and fee of the transaction using the deposit data
  await updateTransaction(transaction.id, TransactionStatus.COMPLETED, {
    amount: amount,
    fee: fee,
  })

  // Update the wallet balance
  const updatedWallet = (await updateWalletBalance(
    userId,
    transaction.wallet?.currency,
    amount,
    fee,
    TransactionType.DEPOSIT,
  )) as unknown as Wallet

  // Transfer the amount from main to trade account within KuCoin
  if (provider === 'kucoin') {
    try {
      // Transferring the amount from main to trade account within KuCoin
      await exchange.transfer(
        transaction.wallet?.currency,
        deposit.amount,
        'main',
        'trade',
      )
    } catch (error) {
      logger.error(`Transfer failed: ${error.message}`)
    }
  }

  const userData = (await getUserById(userId)) as unknown as User
  try {
    sendSpotWalletDepositConfirmationEmail(userData, transaction, updatedWallet)
  } catch (error) {
    logger.error(`Deposit confirmation email failed: ${error.message}`)
  }

  try {
    await processRewards(
      userData.uuid,
      amount,
      'WELCOME_BONUS',
      transaction.wallet?.currency,
      settingsObject,
    )
  } catch (error) {
    logger.error(`Error processing rewards: ${error.message}`)
  }

  return
}

export async function generateWalletAddressQuery(currency: string) {
  const exchange = await (ExchangeManager as any).startExchange()
  const provider = await (ExchangeManager as any).provider

  const connection = await exchange.checkRequiredCredentials()

  if (!connection) {
    logger.error(`Exchange connection failed, please check your credentials`)
    throw new Error('Exchange connection failed')
  }

  const results = {} as any
  switch (provider) {
    case 'binance':
      const curr = await getCurrency(currency)
      if (!curr || !curr.chains) {
        throw new Error('Chains information is missing')
      }
      if (curr.chains.length > 1) {
        // Run all address generation promises in parallel
        const promises = curr.chains.map((chain) => {
          const chainName = exchange.safeString(chain, 'network')
          return fetchCreateDepositAddress(exchange, currency, chainName)
            .then((address) => {
              results[chainName] = address
            })
            .catch((error) => {
              logger.error(
                `Error creating ${chainName} address: ${error.message}`,
              )
            })
        })

        // Wait for all promises to complete
        await Promise.all(promises)
      } else {
        const chain = exchange.safeValue(curr.chains, 0)
        const chainName = exchange.safeString(chain, 'network')
        try {
          const address = await fetchCreateDepositAddress(
            exchange,
            currency,
            chainName,
          )
          results[chainName] = address
        } catch (error) {
          logger.error(`Error creating ${chainName} address: ${error.message}`)
        }
      }
      break
    case 'kucoin':
      try {
        const response = await exchange.publicGetCurrenciesCurrency({
          currency,
        })
        logger.info('Kucoin API Response: ' + JSON.stringify(response))

        const currencyData = exchange.safeValue(response, 'data')
        if (!currencyData) {
          throw new Error('Currency data is missing from the Kucoin response')
        }

        const chains = exchange.safeValue(currencyData, 'chains')
        if (!chains || chains.length === 0) {
          throw new Error(
            'Chain data is missing from the currency data in Kucoin response',
          )
        }

        const addressPromises = chains.map(async (chain) => {
          const chainName = exchange.safeString(chain, 'chainName')
          if (!chainName) {
            logger.warn(
              'Chain name is missing for a chain in the Kucoin response',
            )
            return
          }

          try {
            const address = await fetchCreateDepositAddress(
              exchange,
              currency,
              chainName.toUpperCase(),
            )
            results[chainName.toUpperCase()] = {
              currency: address.currency,
              address: address.address,
              tag: address.tag,
              network: address.network,
            }
          } catch (error) {
            logger.error(
              `Error creating ${chainName.toUpperCase()} address: ${
                error.message
              }`,
            )
          }
        })

        await Promise.all(addressPromises)

        // Check if any address has been added
        if (Object.keys(results).length === 0) {
          throw new Error('No addresses were generated for Kucoin')
        }
      } catch (error) {
        logger.error('Kucoin provider error: ' + error.message)
        throw error
      }

      logger.info('Generated Addresses: ' + JSON.stringify(results))
      break
    default:
      throw new Error('Provider not supported')
  }
  return results
}

function fetchCreateDepositAddress(
  exchange: any,
  currency: string,
  chain: string | null = null,
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetchCreateDepositAddressHelper(
        exchange,
        currency,
        chain,
      )
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
}

function fetchCreateDepositAddressHelper(
  exchange: any,
  currency: string,
  chain: string | null = null,
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await exchange.fetchDepositAddress(
        currency,
        chain ? { network: chain.toLowerCase() } : {},
      )
      if (!response.address || !response.address.length) {
        throw new Error('No wallet address found')
      }
      resolve(response)
    } catch (error) {
      try {
        const response = await exchange.createDepositAddress(
          currency,
          chain ? { network: chain.toLowerCase() } : {},
        )
        resolve(response)
      } catch (error) {
        reject(error)
      }
    }
  })
}

function startVerificationSchedule(
  transactionId: number,
  userId: number,
  trx: string,
) {
  // Clear any existing interval for this transaction (if any)
  const existingInterval = verificationIntervals.get(transactionId)
  if (existingInterval) {
    clearInterval(existingInterval)
  }

  // Schedule the verifyTransaction function to run every 30 seconds
  const interval = setInterval(() => {
    verifyTransaction(userId, trx).catch((error) => {
      console.error('Error verifying transaction:', error)
    })
  }, 30000)

  // Store the interval in the map
  verificationIntervals.set(transactionId, interval)

  // Stop the verification schedule after 30 minutes
  setTimeout(() => {
    stopVerificationSchedule(transactionId)
  }, 1800000) // 30 minutes in milliseconds
}

function stopVerificationSchedule(transactionId: number) {
  const interval = verificationIntervals.get(transactionId)
  if (interval) {
    clearInterval(interval)
    verificationIntervals.delete(transactionId)
  }
}
