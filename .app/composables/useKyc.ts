import useKycs from './kyc'
import useKycTemplate from './kyc/template'

// Composable to make blog tasks easier
export default function useInvestment() {
  // Get all functions from individual composables
  const kycFunctions = useKycs()
  const kycTemplateFunctions = useKycTemplate()

  return {
    ...kycFunctions,
    ...kycTemplateFunctions,
  }
}
