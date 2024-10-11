// servers/backend/http/exchange/chart/controller.ts
import { getHistoricalOHLCV } from './queries'
import { handleController } from '~~/utils'

export const controllers = {
  getHistorical: handleController(async (_, __, ___, query) => {
    return getHistoricalOHLCV(
      query.symbol,
      query.interval,
      query.from,
      query.to,
      query.duration,
    )
  }),
}
