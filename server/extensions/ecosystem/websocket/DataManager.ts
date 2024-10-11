// dataManager.ts

import type { EcosystemTokenContractType } from '@prisma/client'
import { ethers } from 'ethers'
import { getWallet } from '~~/http/wallets/queries'
import { createLogger } from '../../../logger'
import { getToken } from '../user/tokens/queries'
import { handleDeposit } from '../user/wallets/queries'
import { chainConfigs, getWssProvider } from '../utils'
import { decodeTransactionData, fromBigInt, fromWei } from '../utils/blockchain'
import { isProviderHealthy } from '../utils/provider'
import type { Order } from '../utils/scylla/queries'
import { fetchTransactions } from '../utils/transactions'
import {
  createTransactionDetailsForUTXO,
  recordUTXO,
  verifyUTXOTransaction,
  watchAddressBlockCypher,
} from '../utils/utxo'
import {
  generateIdentifier,
  loadFromRedis,
  offloadToRedis,
} from '../utils/websocket'
import ClientConnection from './ClientConnection'
import type ClientHandler from './ClientHandler'

const logger = createLogger('Ecosystem DataManager')

export default class DataManager {
  private static instance: DataManager | null = null
  private clientConnection: ClientConnection
  public chainProviders: Map<string, any> = new Map()

  private constructor(clientConnection: ClientConnection) {
    this.clientConnection = clientConnection
  }

  public async handleOrderBroadcast(order: Order) {
    // Notify the clients about their order updates based on User UUID
    const interestedInOrder =
      await this.clientConnection.getInterestedClientsByUserId(
        order.user_id.toString(),
      )

    const filteredOrder = {
      ...order,
      price: fromBigInt(order.price),
      amount: fromBigInt(order.amount),
      filled: fromBigInt(order.filled),
      remaining: fromBigInt(order.remaining),
      cost: fromBigInt(order.cost),
      fee: fromBigInt(order.fee),
      average: fromBigInt(order.average),
    }

    // Broadcast the filtered order information to interested clients
    this.broadcastToClients(interestedInOrder, {
      type: 'orders',
      result: filteredOrder,
    })
  }

  public async handleTickerBroadcast(symbol: string, ticker: any) {
    const identifier = generateIdentifier('watchTicker', { symbol })
    const interestedClients = await this.clientConnection.getInterestedClients(
      'watchTicker',
      identifier,
    )
    this.broadcastToClients(interestedClients, {
      type: 'ticker',
      symbol,
      result: ticker,
    })
  }

  public async handleCandleBroadcast(
    symbol: string,
    interval: string,
    candle: any,
  ) {
    const identifier = generateIdentifier('watchCandles', { symbol, interval })
    const interestedClients = await this.clientConnection.getInterestedClients(
      'watchCandles',
      identifier,
    )
    this.broadcastToClients(interestedClients, {
      type: 'candles',
      symbol,
      interval,
      result: candle,
    })
  }

  public async handleOrderBookUpdate(symbol, book) {
    try {
      const identifier = generateIdentifier('watchOrderBook', { symbol })
      const interestedClients =
        await this.clientConnection.getInterestedClients(
          'watchOrderBook',
          identifier,
        )

      if (!book) {
        logger.error('Book is undefined')
        return
      }

      const orderbook = {
        asks: Object.entries(book.asks || {}).map(([price, amount]) => [
          fromWei(Number(price)),
          fromWei(Number(amount)),
        ]),
        bids: Object.entries(book.bids || {}).map(([price, amount]) => [
          fromWei(Number(price)),
          fromWei(Number(amount)),
        ]),
      }

      this.broadcastToClients(interestedClients, {
        type: 'orderbook',
        symbol,
        result: orderbook,
      })
    } catch (error) {
      logger.error(`Failed to fetch and broadcast order book: ${error}`)
    }
  }

  public async handleTickersBroadcast(tickers) {
    const interestedClients = await this.clientConnection.getInterestedClients(
      'watchTickers',
      'tickers',
    )

    this.broadcastToClients(interestedClients, {
      type: 'tickers',
      result: tickers,
    })
  }

  static getInstance(): DataManager {
    if (!this.instance) {
      this.instance = new DataManager(ClientConnection.getInstance())
    }
    return this.instance
  }

  public async removeUnusedChainProviders(chain: string) {
    if (this.chainProviders.has(chain)) {
      const provider = this.chainProviders.get(chain)
      if (provider) {
        provider.removeAllListeners()
      }
      this.chainProviders.delete(chain)
    }
  }

  async initializeProvider(chain: string): Promise<any> {
    try {
      let attempts = 0
      let provider: any = null

      while (attempts < 3) {
        provider = getWssProvider(chain)
        const isHealthy = await isProviderHealthy(provider)

        if (isHealthy) {
          return provider
        }

        attempts++
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      this.removeUnusedChainProviders(chain)
      return null
    } catch (error) {
      logger.error(`Error in initializeProvider: ${error.message}`)
    }
  }

  async watchDeposits(
    chain: string,
    address: string,
    uuid: string,
    currency: string,
    contractType: EcosystemTokenContractType,
  ) {
    try {
      let provider
      if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(chain)) {
        watchAddressBlockCypher(chain, address, async (transaction) => {
          try {
            // Assuming walletId is available in your context
            const wallet = await getWallet(uuid)

            // Process transaction details
            const txDetails = await createTransactionDetailsForUTXO(
              uuid,
              transaction,
              address,
              chain,
            )
            await this.storeAndBroadcastTransaction(txDetails, transaction.hash)

            // Record UTXOs
            transaction.outputs.forEach((output, index) => {
              if (output.addresses.includes(address)) {
                recordUTXO(
                  wallet.id,
                  transaction.hash,
                  index,
                  output.value,
                  output.script,
                  false,
                )
              }
            })
          } catch (error) {
            logger.error(`Error in processUTXOTransaction: ${error.message}`)
          }
        })
      } else {
        const provider = await this.initializeProvider(chain)
        if (!provider) {
          return
        }
        this.chainProviders.set(chain, provider)

        let filter, decimals
        const feeDecimals = chainConfigs[chain].decimals
        let depositFound = false

        if (contractType === 'NATIVE') {
          decimals = chainConfigs[chain].decimals
          let startTime = Math.floor(Date.now() / 1000)

          const verifyDeposits = async () => {
            if (depositFound) {
              return
            }

            const transactions = await fetchTransactions(chain, address)

            for (const tx of transactions) {
              if (
                tx.to &&
                tx.to.toLowerCase() === address.toLowerCase() &&
                Number(tx.timestamp) > startTime &&
                Number(tx.status) === 1
              ) {
                depositFound = true

                try {
                  const txDetails = await this.createTransactionDetails(
                    uuid,
                    tx,
                    address,
                    chain,
                    decimals,
                    feeDecimals,
                    'DEPOSIT',
                  )

                  await this.storeAndBroadcastTransaction(txDetails, tx.hash)
                } catch (error) {
                  logger.error(
                    `Error in processNativeTransaction: ${error.message}, Transaction Hash: ${tx.hash}`,
                  )
                }
                startTime = Math.floor(Date.now() / 1000)
                break
              }
            }
          }

          verifyDeposits()
          const intervalId = setInterval(verifyDeposits, 10000)

          const checkDepositFound = () => {
            if (depositFound) {
              clearInterval(intervalId) // Clear the interval if deposit is found
            } else {
              setTimeout(checkDepositFound, 1000) // Check again after a delay
            }
          }

          checkDepositFound()
        } else {
          // For ERC-20 token transfers, use the contract's address and Transfer event topics
          const token = await getToken(chain, currency)
          if (!token) {
            logger.error(`Token ${currency} not found`)
            return
          }
          decimals = token.decimals
          filter = {
            address: token.contract,
            topics: [
              ethers.id('Transfer(address,address,uint256)'),
              null,
              address ? ethers.zeroPadValue(address, 32) : null,
            ],
          }

          let eventListener: any = null

          const stopEventListener = () => {
            if (eventListener) {
              provider.off(filter, eventListener)
            }
          }

          eventListener = async (log, event) => {
            try {
              await this.processTransaction(
                uuid,
                log.transactionHash,
                provider,
                address,
                chain,
                decimals,
                feeDecimals,
              )
              stopEventListener() // Stop listening for further events
            } catch (error) {
              logger.error(`Error in pending handler: ${error.message}`)
            }
          }

          provider.on(filter, eventListener)
        }

        provider.on('error', (error) => {
          logger.error(`Provider error: ${error.message}`)
        })
      }

      // Start verifying pending transactions
      this.verifyPendingTransactions(provider)
      this.clientConnection.checkSubscriptions()
    } catch (error) {
      logger.error(`Error in watchDeposits: ${error.message}`)
    }
  }

  async processTransaction(
    uuid: string,
    txHash: string,
    provider: any,
    address: string,
    chain: string,
    decimals: number,
    feeDecimals: number,
  ) {
    try {
      const tx = await provider.getTransaction(txHash)
      if (!tx || !tx.data) return

      const decodedData = decodeTransactionData(tx.data)
      const realTo = decodedData.to || tx.to
      const amount = decodedData.amount || tx.value

      if (!realTo || realTo.toLowerCase() !== address.toLowerCase()) return

      const txDetails = await this.createTransactionDetails(
        uuid,
        tx,
        realTo,
        chain,
        decimals,
        feeDecimals,
        'DEPOSIT',
        amount,
      )

      await this.storeAndBroadcastTransaction(txDetails, txHash)
    } catch (error) {
      logger.error(
        `Error in processTransaction: ${error.message}, Transaction Hash: ${txHash}`,
      )
    }
  }

  async createTransactionDetails(
    uuid,
    tx,
    toAddress,
    chain,
    decimals,
    feeDecimals,
    type,
    amount = tx.amount,
  ) {
    const formattedAmount = ethers.formatUnits(amount.toString(), decimals)
    const formattedGasLimit = tx.gasLimit ? tx.gasLimit.toString() : 'N/A'
    const formattedGasPrice = tx.gasPrice
      ? ethers.formatUnits(tx.gasPrice.toString(), feeDecimals)
      : 'N/A'

    return {
      uuid,
      chain,
      hash: tx.hash,
      type,
      from: tx.from,
      to: toAddress,
      amount: formattedAmount,
      gasLimit: formattedGasLimit,
      gasPrice: formattedGasPrice,
    }
  }

  async storeAndBroadcastTransaction(txDetails, txHash) {
    const pendingTransactions =
      (await loadFromRedis('pendingTransactions')) || {}
    pendingTransactions[txHash] = txDetails
    await offloadToRedis('pendingTransactions', pendingTransactions)

    const identifier = generateIdentifier('watchDeposits', {
      chain: txDetails.chain,
      address: txDetails.address || txDetails.to,
    })

    const interestedClients = await this.clientConnection.getInterestedClients(
      'watchDeposits',
      identifier,
    )
    this.broadcastToClients(interestedClients, {
      type: 'deposits',
      result: txDetails,
    })
  }

  async verifyPendingTransactions(provider: any) {
    const processingTransactions = new Set()

    while (true) {
      try {
        const pendingTransactions =
          (await loadFromRedis('pendingTransactions')) || {}

        if (Object.keys(pendingTransactions).length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }

        const txHashes = Object.keys(pendingTransactions)

        const verificationPromises = txHashes.map(async (txHash) => {
          if (processingTransactions.has(txHash)) {
            return
          }

          try {
            const txDetails = pendingTransactions[txHash]
            if (!txDetails) {
              return
            }

            if (
              ['BTC', 'LTC', 'DOGE', 'DASH'].includes(txDetails.chain) &&
              !txDetails.address
            ) {
              delete pendingTransactions[txHash]
              await offloadToRedis('pendingTransactions', pendingTransactions)

              return
            }

            processingTransactions.add(txHash)

            const identifier = generateIdentifier('watchDeposits', {
              chain: txDetails.chain,
              address: txDetails.address || txDetails.to,
            })

            const interestedClients =
              await this.clientConnection.getInterestedClients(
                'watchDeposits',
                identifier,
              )

            let toBroadcast = true
            if (interestedClients.length === 0) {
              toBroadcast = false
            }

            let isConfirmed, updatedTxDetails
            if (['BTC', 'LTC', 'DOGE', 'DASH'].includes(txDetails.chain)) {
              // Verify UTXO chain transactions
              const data = await verifyUTXOTransaction(txDetails.chain, txHash)
              isConfirmed = data.confirmed
              const status = isConfirmed ? 'COMPLETED' : 'FAILED'
              updatedTxDetails = {
                ...txDetails,
                status,
              }
            } else {
              // Existing logic for EVM chains
              const receipt = await provider.getTransactionReceipt(txHash)
              if (!receipt) {
                processingTransactions.delete(txHash) // Remove from processing if receipt not found
                return
              }

              isConfirmed = receipt && receipt.status === 1
              const status = isConfirmed ? 'COMPLETED' : 'FAILED'
              updatedTxDetails = {
                ...txDetails,
                gasUsed: receipt.gasUsed.toString(),
                status,
              }
            }

            if (isConfirmed) {
              try {
                const response = await handleDeposit(updatedTxDetails)
                if (!response) {
                  logger.info(`Transaction ${txHash} failed to handle deposit`)
                }
              } catch (error) {
                logger.error(
                  `Error handling deposit for transaction ${txHash}: ${error.message}`,
                )
              }
            }

            if (toBroadcast) {
              this.broadcastToClients(interestedClients, {
                type: 'deposits',
                result: updatedTxDetails,
              })
            }

            delete pendingTransactions[txHash]
            await offloadToRedis('pendingTransactions', pendingTransactions)
          } catch (error) {
            logger.error(
              `Error verifying transaction ${txHash}: ${error.message}`,
            )
          } finally {
            processingTransactions.delete(txHash)
          }
        })

        await Promise.all(verificationPromises)

        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        logger.error(`Error in verifyPendingTransactions: ${error.message}`)
      }
    }
  }

  private async broadcastToClients(
    clients: ClientHandler[],
    message: any,
  ): Promise<void> {
    clients.forEach((client) => {
      client.sendToClient(message)
    })
  }
}
