import type { MaybeRef } from '@vueuse/shared'
import { format, isDate, parseISO } from 'date-fns'

const DateFormats = {
  Short: 'MMM do, yyyy',
  Long: 'cccc, LLLL do, yyyy h:mm aa',
}

export type DateFormatsNames = keyof typeof DateFormats

export function formatPrice(price?: MaybeRef<number>, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(unref(price ?? 0)).replace('.00', '')
}

export function formatDate(date?: any, pattern: DateFormatsNames = 'Short') {
  if (!date) return ''
  if (isDate(date)) return format(date, DateFormats[pattern])
  return format(parseISO(date), DateFormats[pattern])
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatFileSize(bytes: any, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = si
    ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bytes.toFixed(dp) + ' ' + units[u]
}
