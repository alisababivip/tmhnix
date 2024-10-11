import type { Logger } from 'winston'
import { fetchFiatCurrencyPrices } from './http/currencies/controller'
import { processPendingOrders } from './http/exchange/binary/orders/controller'
import { processCurrenciesPrices } from './http/exchange/currencies/controller'
import { checkInvestments } from './http/investment/queries'
import {
  processPendingDeposits,
  processPendingWithdrawals,
} from './http/wallets/spot/controller'
import { createLogger } from './logger'

// Task function signature
type TaskFunction = () => Promise<any>

const logger: Logger = createLogger('Cron')

export function initializeCrons() {
  runTaskAtInterval(
    'crypto currencies prices',
    processCurrenciesPrices,
    2 * 60 * 1000,
  )
  runTaskAtInterval('Pending Deposits', processPendingDeposits, 15 * 60 * 1000)
  runTaskAtInterval(
    'Pending Withdrawals',
    processPendingWithdrawals,
    30 * 60 * 1000,
  )
  runTaskAtSpecificMinute('All concurrent tasks', runConcurrentTasks, 0)
  logger.info('Cron jobs initialized!')
}

function runTaskAtInterval(name: string, task: TaskFunction, interval: number) {
  let isRunning = false
  setInterval(async () => {
    if (isRunning) {
      return
    }
    isRunning = true
    try {
      await task()
    } catch (error) {
      logger.error(`Error running ${name} scheduler: ${error}`)
    } finally {
      isRunning = false
    }
  }, interval)
}

function runTaskAtSpecificMinute(
  name: string,
  task: TaskFunction,
  minute: number,
) {
  setInterval(async () => {
    const date = new Date()
    if (date.getMinutes() === minute) {
      try {
        await task()
      } catch (error) {
        logger.error(`Error running ${name} scheduler: ${error}`)
      }
    }
  }, 60 * 1000)
}

async function runConcurrentTasks() {
  const tasks: TaskFunction[] = [
    checkInvestments,
    fetchFiatCurrencyPrices,
    processPendingOrders,
  ]
  try {
    await Promise.all(tasks.map((task) => task()))
  } catch (error) {
    logger.error(`Error running tasks concurrently: ${error}`)
  }
}
