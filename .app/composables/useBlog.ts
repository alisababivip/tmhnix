import useAuthor from './blog/useAuthor'
import useCategory from './blog/useCategory'
import usePost from './blog/usePost'
import useTag from './blog/useTag'

// Composable to make blog tasks easier
export default function useBlog() {
  // Get all functions from individual composables
  const authorFunctions = useAuthor()
  const categoryFunctions = useCategory()
  const tagFunctions = useTag()
  const postFunctions = usePost()

  return {
    ...authorFunctions,
    ...categoryFunctions,
    ...tagFunctions,
    ...postFunctions,
  }
}
