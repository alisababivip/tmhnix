import useAdminFaqEntries from './faq/admin/entries'
import useAdminFaq from './faq/admin'
import useUserFaqCategories from './faq/user/categories'
import useUserFaqEntrie from './faq/user/entries'

export default function useFaq() {
  // Admin composables
  const adminFaqEntries = useAdminFaqEntries()
  const adminFaq = useAdminFaq()

  // User composables
  const userFaqCategories = useUserFaqCategories()
  const userFaq = useUserFaqEntrie()

  // Combine and return all functions and data from the composables
  return {
    // Admin
    ...adminFaqEntries,
    ...adminFaq,
    // User
    ...userFaqCategories,
    ...userFaq,
  }
}
