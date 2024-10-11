import useAdmin from './ecommerce/admin'
import useAdminCategories from './ecommerce/admin/categories'
import useAdminDiscounts from './ecommerce/admin/discounts'
import useAdminOrders from './ecommerce/admin/orders'
import useAdminProducts from './ecommerce/admin/products'
import useAdminReviews from './ecommerce/admin/reviews'
import useUserCategories from './ecommerce/user/categories'
import useUserDiscounts from './ecommerce/user/discounts'
import useUserOrders from './ecommerce/user/orders'
import useUserProducts from './ecommerce/user/products'
import useUserReviews from './ecommerce/user/reviews'
import useUserWishlist from './ecommerce/user/wishlist'

export default function useEcommerce() {
  // Admin composables
  const admin = useAdmin()
  const adminCategories = useAdminCategories()
  const adminProducts = useAdminProducts()
  const adminOrders = useAdminOrders()
  const adminReviews = useAdminReviews()
  const adminDiscounts = useAdminDiscounts()

  // User composables
  const userCategories = useUserCategories()
  const userProducts = useUserProducts()
  const userOrders = useUserOrders()
  const userReviews = useUserReviews()
  const userDiscounts = useUserDiscounts()
  const userWishlist = useUserWishlist()

  // Combine and return all functions and data from the composables
  return {
    // Admin
    ...admin,
    ...adminCategories,
    ...adminProducts,
    ...adminOrders,
    ...adminReviews,
    ...adminDiscounts,
    // User
    ...userCategories,
    ...userProducts,
    ...userOrders,
    ...userReviews,
    ...userDiscounts,
    ...userWishlist,
  }
}
