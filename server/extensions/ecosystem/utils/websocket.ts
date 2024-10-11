import dayjs from 'dayjs'
import { promisify } from 'util'
import { redis } from '../../../utils/redis'
import type { SubscriptionType } from '../websocket/ClientHandler'

const setAsync = promisify(redis.set).bind(redis)
const getAsync = promisify(redis.get).bind(redis)
const delAsync = promisify(redis.del).bind(redis)
const keysAsync = promisify(redis.keys).bind(redis)

export function generateIdentifier(
  type: SubscriptionType,
  params: any,
): string {
  switch (type) {
    case 'watchDeposits':
      return `${params.chain}-${params.address.toLowerCase()}`
    case 'watchOrderBook':
      return `${params.symbol}`
    case 'watchTickers':
      return `tickers`
    case 'watchTicker':
      return params.symbol
    case 'watchCandles':
      return `${params.symbol}-${params.interval}`
    case 'watchOrders':
      return `${params.id}`
    default:
      return ''
  }
}

export function extractParamsFromIdentifier(
  type: SubscriptionType,
  identifier: string,
) {
  let params = {}
  switch (type) {
    case 'watchDeposits':
      const [chain, address] = identifier.split('-')
      params = { chain, address }
      break
    case 'watchOrderBook':
      params = { symbol: identifier }
      break
    case 'watchTickers':
      break
    case 'watchTicker':
      params = { symbol: identifier }
      break
    case 'watchCandles':
      const [symbol, interval] = identifier.split('-')
      params = { symbol, interval }
      break
    case 'watchOrders':
      params = { id: identifier }
      break
    default:
      break
  }
  return params
}

export function intervalToMs(interval: string): number {
  const units = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  }

  const unit = interval.slice(-1)
  const value = parseInt(interval.slice(0, -1), 10)

  return units[unit] * value
}

export function normalizeTimeToInterval(
  timestamp: number,
  interval: string,
): number {
  const date = dayjs(timestamp)

  switch (interval.slice(-1)) {
    case 'm':
      return date.startOf('minute').valueOf()
    case 'h':
      return date.startOf('hour').valueOf()
    case 'd':
      return date.startOf('day').valueOf()
    case 'w':
      return date.startOf('week').valueOf()
    default:
      throw new Error(`Invalid interval: ${interval}`)
  }
}

export async function offloadToRedis<T>(key: string, value: T): Promise<void> {
  const serializedValue = JSON.stringify(value)
  await setAsync(key, serializedValue)
}

export async function loadKeysFromRedis(pattern: string): Promise<string[]> {
  try {
    const keys = await keysAsync(pattern)
    return keys
  } catch (error) {
    console.error('Failed to fetch keys:', error)
    return []
  }
}

export async function loadFromRedis(identifier: string): Promise<any | null> {
  const dataStr = await getAsync(identifier)
  if (!dataStr) return null
  try {
    return JSON.parse(dataStr)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
  }
}

export async function removeFromRedis(key: string): Promise<void> {
  try {
    const delResult = await delAsync(key)
    console.log(`Delete Result for key ${key}: `, delResult)
  } catch (error) {}
}

export async function convertToOrderArray(
  rawData: string[],
): Promise<[number, number][]> {
  const parsedData: [number, number][] = []
  for (let i = 0; i < rawData.length; i += 2) {
    parsedData.push([parseFloat(rawData[i]), parseFloat(rawData[i + 1])])
  }
  return parsedData
}
