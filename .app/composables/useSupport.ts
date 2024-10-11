import useAdminSupport from './support/admin'
import useChat from './support/chat'
import useUserSupport from './support/user'

// Composable to make blog tasks easier
export default function useBlog() {
  // Get all functions from individual composables
  const adminSupportFunctions = useAdminSupport()
  const userSupportFunctions = useUserSupport()
  const chatFunctions = useChat()

  return {
    ...adminSupportFunctions,
    ...userSupportFunctions,
    ...chatFunctions,
  }
}
