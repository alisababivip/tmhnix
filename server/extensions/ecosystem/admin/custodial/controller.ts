// adminWalletController.ts
import { ContractFactory, ethers, isError } from 'ethers'
import { createLogger } from '~~/logger'
import type { EcosystemMasterWallet } from '~~/types'
import { handleController } from '~~/utils'
import { decrypt } from '~~/utils/encrypt'
import { getNoPermitTokens } from '../../admin/tokens/queries'
import { chainConfigs, getProvider, getSmartContract } from '../../utils'
import { getAdjustedGasPrice } from '../../utils/gas'
import { getMasterWalletByChainFull } from '../wallets/queries'
import {
  getCustodialWallet,
  getCustodialWallets,
  storeCustodialWallet,
} from './queries'
const logger = createLogger('Ecosystem Custodial Wallets')

export const controllers = {
  index: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('Unauthorized')
    const { chain } = params
    return await getCustodialWallets(chain)
  }),

  show: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('Unauthorized')
    const { uuid } = params
    const custodialWallet = (await getCustodialWallet(uuid)) as any
    if (!custodialWallet) {
      throw new Error(`Custodial wallet not found for uuid: ${uuid}`)
    }
    const provider = getProvider(custodialWallet.chain)
    if (!provider) {
      throw new Error('Provider not initialized')
    }
    const contract = await getCustodialWalletContract(
      custodialWallet.address,
      provider,
    )

    const chainCurrency = chainConfigs[custodialWallet.chain].currency
    const tokens = await getNoPermitTokens(custodialWallet.chain)
    const { balances, native } = await getCustodialWalletBalances(
      contract,
      tokens,
    )

    // Append the tokenBalances to the custodialWallet object
    custodialWallet.balances = balances
    custodialWallet.nativeBalance = native
    custodialWallet.nativeCurrency = chainCurrency

    return custodialWallet
  }),

  deploy: handleController(async (_, __, ___, query, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { chain } = query
      const wallet = await getMasterWalletByChainFull(chain)
      if (!wallet) {
        throw new Error(`Master wallet not found for chain: ${chain}`)
      }
      const walletContractAddress = await deployCustodialContract(wallet)
      if (!walletContractAddress) {
        throw new Error('Failed to deploy custodial wallet contract')
      }
      const custodialWallet = await storeCustodialWallet(
        wallet.id,
        wallet.chain,
        walletContractAddress,
      )
      return custodialWallet
    } catch (error: any) {
      if (isError(error, 'INSUFFICIENT_FUNDS')) {
        // Handle insufficient funds
        logger.error('Insufficient funds for transaction')
      }

      // General error logging
      logger.error(
        `Failed to deploy custodial wallet contract: ${error.message}`,
      )

      throw new Error(error.message)
    }
  }),
}

export async function getCustodialWalletBalances(
  contract,
  tokens,
  format: boolean = true,
) {
  const tokensAddresses = tokens.map((token) => token.contract)
  const [nativeBalance, tokenBalances] =
    await contract.getAllBalances(tokensAddresses)
  const balances = tokenBalances.map((balance, index) => ({
    ...tokens[index],
    balance: format
      ? ethers.formatUnits(balance, tokens[index].decimals)
      : balance,
  }))

  const native = format ? ethers.formatEther(nativeBalance) : nativeBalance
  return { balances, native }
}

export async function getCustodialWalletTokenBalance(
  contract,
  tokenContractAddress,
) {
  return await contract.getTokenBalance(tokenContractAddress)
}

export async function getCustodialWalletNativeBalance(contract) {
  return await contract.getNativeBalance()
}

export async function getCustodialWalletContract(
  address: string,
  provider: any,
) {
  const { abi } = await getSmartContract('wallet', 'CustodialWalletERC20')
  if (!abi) {
    throw new Error('Smart contract ABI or Bytecode not found')
  }

  return new ethers.Contract(address, abi, provider)
}

export async function deployCustodialContract(
  masterWallet: EcosystemMasterWallet,
): Promise<string | undefined> {
  try {
    const provider = getProvider(masterWallet.chain)
    if (!provider) {
      throw new Error('Provider not initialized')
    }

    // Decrypt mnemonic
    let decryptedData
    try {
      decryptedData = JSON.parse(decrypt(masterWallet.data))
    } catch (error) {
      throw new Error(`Failed to decrypt mnemonic: ${error.message}`)
    }
    if (!decryptedData || !decryptedData.privateKey) {
      throw new Error('Decrypted data or Mnemonic not found')
    }
    const { privateKey } = decryptedData

    // Create a signer
    const signer = new ethers.Wallet(privateKey).connect(provider)

    const { abi, bytecode } = await getSmartContract(
      'wallet',
      'CustodialWalletERC20',
    )
    if (!abi || !bytecode) {
      throw new Error('Smart contract ABI or Bytecode not found')
    }

    // Create Contract Factory
    const custodialWalletFactory = new ContractFactory(abi, bytecode, signer)

    // Fetch adjusted gas price
    const gasPrice = await getAdjustedGasPrice(provider)

    // Deploy the contract with dynamic gas settings
    const custodialWalletContract = await custodialWalletFactory.deploy(
      masterWallet.address,
      {
        gasPrice: gasPrice,
      },
    )

    // Wait for the contract to be deployed
    const response = await custodialWalletContract.waitForDeployment()

    return await response.getAddress()
  } catch (error: any) {
    if (isError(error, 'INSUFFICIENT_FUNDS')) {
      // Specific handling for not enough funds
      throw new Error('Not enough funds to deploy the contract')
    }
    throw new Error(error.message)
  }
}
