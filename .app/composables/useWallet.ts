import adminFunctions from './admin/wallets'
import useDepositGateways from './admin/wallets/deposit/gateways'
import useDepositMethods from './admin/wallets/deposit/methods'
import adminTransactionsFunctions from './admin/wallets/transactions'
import adminWithdrawMethodsFunctions from './admin/wallets/withdraw/methods'
import useFiatWallet from './wallets/fiat'
import generalFunctions from './wallets/general'
import spotFunctions from './wallets/spot'
import transactionFunctions from './wallets/transactions'

// Composable to make blog tasks easier
export default function useWallet() {
  const generalWalletFunctions = generalFunctions()
  const fiatWalletFunctions = useFiatWallet()
  const spotWalletFunctions = spotFunctions()
  const transactionsFunctions = transactionFunctions()
  const adminWalletFunctions = adminFunctions()
  const adminWithdrawMethodsWalletFunctions = adminWithdrawMethodsFunctions()
  const adminTransactionsWalletFunctions = adminTransactionsFunctions()
  const adminDepositMethodsWalletFunctions = useDepositMethods()
  const adminDepositGatewaysWalletFunctions = useDepositGateways()

  return {
    ...generalWalletFunctions,
    ...fiatWalletFunctions,
    ...spotWalletFunctions,
    ...transactionsFunctions,
    ...adminWalletFunctions,
    ...adminWithdrawMethodsWalletFunctions,
    ...adminDepositMethodsWalletFunctions,
    ...adminTransactionsWalletFunctions,
    ...adminDepositGatewaysWalletFunctions,
  }
}
