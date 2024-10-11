import useAdminPage from './pages/admin'
import useUserPage from './pages/user'

// Composable to make blog tasks easier
export default function useBlog() {
  // Get all functions from individual composables
  const adminPageFunctions = useAdminPage()
  const userPageFunctions = useUserPage()

  return {
    ...adminPageFunctions,
    ...userPageFunctions,
  }
}
