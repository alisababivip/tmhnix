import BigNumber from 'bignumber.js'
import { redis } from '../../../utils/redis'
import { getTokenDecimal } from '../admin/tokens/queries'

export const extractTransactionInfo = (tx) => {
  let targetAddress = null
  let details = null

  if (tx.data.startsWith('0x')) {
    if (tx.data === '0x') {
      targetAddress = tx.to
      details = 'Direct transfer of main blockchain token'
    } else {
      const methodID = tx.data.substring(0, 10)

      switch (methodID) {
        case '0xa9059cbb':
          targetAddress = `0x${tx.data.substring(34, 74)}`.toLowerCase()
          const amount = parseInt(tx.data.substring(74, 138), 16)
          details = `ERC20 token transfer of ${amount} tokens`
          break

        case '0xf340fa01':
          targetAddress = `0x${tx.data.substring(34, 74)}`.toLowerCase()
          details = 'Deposit with an upline'
          break

        default:
          details = 'Unknown function'
          break
      }
    }
  }

  return { targetAddress, details }
}

export function decodeTransactionData(data: string) {
  if (data.startsWith('0xa9059cbb')) {
    const to = '0x' + data.slice(34, 74)
    const amount = BigInt(`0x${data.slice(74, 138)}`)
    return { type: 'ERC20', to, amount }
  } else if (data.startsWith('0xf340fa01')) {
    const to = '0x' + data.slice(34, 74)
    return { type: 'Deposit', to }
  } else if (data === '0x') {
    return { type: 'Native' }
  } else {
    return { type: 'Unknown' }
  }
}

export function toBigInt(value: number): bigint {
  const bigNumber = new BigNumber(value)
  const scaledNumber = bigNumber.shiftedBy(18)
  return BigInt(scaledNumber.toFixed())
}

export function toBigIntFloat(number: number): bigint {
  const bigNumber = new BigNumber(number)
  const scaledNumber = bigNumber.shiftedBy(18)
  return BigInt(scaledNumber.toFixed(0))
}

export function removeTolerance(
  bigintValue: bigint,
  toleranceDigits = 2,
): bigint {
  const bigNumberValue = new BigNumber(bigintValue.toString())
  const tolerance = new BigNumber(10).pow(toleranceDigits)

  if (bigNumberValue.isLessThan(tolerance)) {
    return bigintValue
  }

  return BigInt(
    bigNumberValue
      .dividedToIntegerBy(tolerance)
      .multipliedBy(tolerance)
      .toFixed(),
  )
}

export function fromBigInt(value: bigint): number {
  const bigNumberValue = new BigNumber(value.toString())
  return bigNumberValue.shiftedBy(-18).toNumber()
}

export function fromBigIntMultiply(value1: bigint, value2: bigint): number {
  const bigNumberValue1 = new BigNumber(value1.toString())
  const bigNumberValue2 = new BigNumber(value2.toString())

  const result = bigNumberValue1.multipliedBy(bigNumberValue2).shiftedBy(-36)
  return result.toNumber()
}

export function fromWei(value: number): number {
  return value / Math.pow(10, 18)
}

export function toWei(value: number): number {
  return value * Math.pow(10, 18)
}
export function convertBigInt(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigInt(item))
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString()
      } else if (typeof obj[key] === 'bigint') {
        newObj[key] = fromBigInt(obj[key])
      } else {
        newObj[key] = convertBigInt(obj[key])
      }
    }
    return newObj
  } else if (typeof obj === 'bigint') {
    return obj.toString() // Fallback to string if we don't have the token decimals
  } else {
    return obj
  }
}

export async function cacheTokenDecimals() {
  const tokenDecimals = await getTokenDecimal()
  await redis.setex('token_decimals', 86000, JSON.stringify(tokenDecimals))
  console.log('Cached token decimals')
}

export async function getCachedTokenDecimals(): Promise<{
  [key: string]: number
}> {
  let cachedData = await redis.get('token_decimals')
  if (cachedData) {
    return JSON.parse(cachedData)
  }

  // If cache is empty, populate it.
  await cacheTokenDecimals()

  // Fetch again after populating.
  cachedData = await redis.get('token_decimals')
  if (cachedData) {
    return JSON.parse(cachedData)
  }

  // Return an empty object if it still fails.
  return {}
}

export const BigIntReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

export function standardUnitToSatoshi(amount, chain) {
  const conversionFactor = getConversionFactor(chain)
  return Math.round(amount * conversionFactor)
}

export function satoshiToStandardUnit(satoshi, chain) {
  const conversionFactor = getConversionFactor(chain)
  return satoshi / conversionFactor // This can be a floating-point number
}

function getConversionFactor(chain) {
  return {
    BTC: 100000000, // For Bitcoin
    LTC: 100000000, // For Litecoin
    DOGE: 100000000, // For Dogecoin (adjust if different)
  }[chain]
}

export const litecoinNetwork = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
}

export const dogecoinNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'doge',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
}

export const dashNetwork = {
  messagePrefix: '\x19Dash Signed Message:\n',
  bech32: 'dash',
  bip32: {
    public: 0x02fe52f8,
    private: 0x02fe52cc,
  },
  pubKeyHash: 0x4c,
  scriptHash: 0x10,
  wif: 0xcc,
}

export const bitcoinCashNetwork = {
  messagePrefix: '\x19Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
}
