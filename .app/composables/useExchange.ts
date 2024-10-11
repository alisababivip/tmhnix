import useAdminOrders from './admin/orders'
import useBinary from './exchange/binary'
import useChart from './exchange/chart'
import useCurrencies from './exchange/currencies'
import useMarkets from './exchange/markets'
import useOrders from './exchange/orders'
import useWatchlist from './exchange/watchlist'

export default function useExchange() {
  const marketsFunctions = useMarkets()
  const currenciesFunctions = useCurrencies()
  const ordersFunctions = useOrders()
  const binaryFunctions = useBinary()
  const adminOrdersFunctions = useAdminOrders()
  const watchListFunctions = useWatchlist()
  const chartFunctions = useChart()

  return {
    ...marketsFunctions,
    ...currenciesFunctions,
    ...ordersFunctions,
    ...binaryFunctions,
    ...adminOrdersFunctions,
    ...watchListFunctions,
    ...chartFunctions,
  }
}
