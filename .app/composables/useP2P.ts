import useAdminP2PDisputes from './p2p/admin/disputes'
import useAdminP2POffers from './p2p/admin/offers'
import useAdminP2PReviews from './p2p/admin/reviews'
import useAdminP2PTrades from './p2p/admin/trades'
import useAdminP2PPaymentMethods from './p2p/admin/payment-methods'
import useAdminP2PEscrows from './p2p/admin/escrows'
import useAdminP2P from './p2p/admin'
import useUserP2POffers from './p2p/user/offers'
import useUserP2PReviews from './p2p/user/reviews'
import useUserP2PTrades from './p2p/user/trades'
import useUserP2PDisputes from './p2p/user/disputes'
import useUserP2PPaymentMethods from './p2p/user/payment-methods'

export default function useP2P() {
  // Admin composables
  const adminP2POffers = useAdminP2POffers()
  const adminP2PTrades = useAdminP2PTrades()
  const adminP2PReviews = useAdminP2PReviews()
  const adminP2PDisputes = useAdminP2PDisputes()
  const adminP2PPaymentMethods = useAdminP2PPaymentMethods()
  const adminP2PEscrows = useAdminP2PEscrows()
  const adminP2P = useAdminP2P()

  // User composables
  const userP2POffers = useUserP2POffers()
  const userP2PTrades = useUserP2PTrades()
  const userP2PReviews = useUserP2PReviews()
  const userP2PDisputes = useUserP2PDisputes()
  const userP2PPaymentMethods = useUserP2PPaymentMethods()

  // Combine and return all functions and data from the composables
  return {
    // Admin
    ...adminP2POffers,
    ...adminP2PTrades,
    ...adminP2PReviews,
    ...adminP2PDisputes,
    ...adminP2PPaymentMethods,
    ...adminP2PEscrows,
    ...adminP2P,
    // User
    ...userP2POffers,
    ...userP2PTrades,
    ...userP2PReviews,
    ...userP2PDisputes,
    ...userP2PPaymentMethods,
  }
}
