import { ethers } from 'ethers'
import { getChainId, getSmartContract, getTimestampInSeconds } from '.'
import { createLogger } from '../../../logger'
import { decrypt } from '../../../utils/encrypt'
import prisma from '../../../utils/prisma'
import {
  getCustodialWalletContract,
  getCustodialWalletTokenBalance,
} from '../admin/custodial/controller'
import { getActiveCustodialWallets } from '../admin/custodial/queries'
import { getMasterWalletByChainFull } from '../admin/wallets/queries'
import { findAlternativeWallet } from '../user/wallets/queries'
import { fromBigInt } from './blockchain'
import { estimateGas, getAdjustedGasPrice } from './gas'
import { getTokenContractAddress } from './tokens'
const logger = createLogger('Ecosystem Wallets')

// Check if there are enough funds for the withdrawal
export async function checkAvailableFunds(userWallet, walletData, totalAmount) {
  try {
    const totalAvailable = await getTotalAvailable(userWallet, walletData)

    if (totalAvailable < totalAmount)
      throw new Error('Insufficient funds for withdrawal including fees')

    return totalAvailable
  } catch (error) {
    logger.error(`Failed to check available funds: ${error.message}`)
    throw new Error('Withdrawal failed - please try again later')
  }
}

// Get total available balance
const getTotalAvailable = async (userWallet, walletData) => {
  const pvEntry = await prisma.ecosystem_private_ledger.findFirst({
    where: {
      wallet_id: userWallet.id,
      index: walletData.index,
      currency: userWallet.currency,
      chain: walletData.chain,
    },
  })
  return userWallet.balance + (pvEntry ? pvEntry.offchain_difference : 0)
}

export async function getGasPayer(chain, provider) {
  // Decrypt the master wallet data to get the private key
  const masterWallet = await getMasterWalletByChainFull(chain)
  if (!masterWallet) {
    logger.error(`Master wallet for chain ${chain} not found`)
    throw new Error('Withdrawal failed - please try again later')
  }
  const { data } = masterWallet
  if (!data) {
    logger.error('Master wallet data not found')
    throw new Error('Withdrawal failed - please try again later')
  }

  const decryptedMasterData = JSON.parse(decrypt(data))
  if (!decryptedMasterData.privateKey) {
    logger.error('Decryption failed - mnemonic not found')
    throw new Error('Withdrawal failed - please try again later')
  }

  // Initialize the admin wallet using the decrypted mnemonic
  try {
    return new ethers.Wallet(decryptedMasterData.privateKey, provider)
  } catch (error) {
    logger.error(`Failed to initialize admin wallet: ${error.message}`)
    throw new Error('Withdrawal failed - please try again later')
  }
}

// Validate Ethereum address
export const validateAddress = (toAddress) => {
  if (!ethers.isAddress(toAddress)) {
    throw new Error(`Invalid target wallet address: ${toAddress}`)
  }
}

export const validateBalances = async (
  tokenContract,
  actualTokenOwner,
  amount,
) => {
  const tokenOwnerBalance = (
    await tokenContract.balanceOf(actualTokenOwner.address)
  ).toString()

  if (tokenOwnerBalance < amount) {
    throw new Error(`Insufficient funds in the wallet for withdrawal`)
  }

  return true
}

// Get Token Owner
export const getTokenOwner = (walletData, provider) => {
  const { data } = walletData
  const decryptedData = JSON.parse(decrypt(data))
  if (!decryptedData.privateKey) {
    throw new Error(`Invalid private key`)
  }
  const { privateKey } = decryptedData
  return new ethers.Wallet(privateKey, provider)
}

// Initialize Token Contracts
export const initializeContracts = async (chain, currency, provider) => {
  const { contractAddress, contractType, tokenDecimals } =
    await getTokenContractAddress(chain, currency)
  const gasPayer = await getGasPayer(chain, provider)
  const { abi } = await getSmartContract('token', 'ERC20')
  const contract = new ethers.Contract(contractAddress, abi, provider)

  return {
    contract,
    contractAddress,
    gasPayer,
    contractType,
    tokenDecimals,
  }
}

// Perform TransferFrom Transaction
export const executeWithdrawal = async (
  tokenContract,
  tokenContractAddress,
  gasPayer,
  tokenOwner,
  toAddress,
  amount,
  provider,
) => {
  const gasPrice = await getAdjustedGasPrice(provider)
  const transferFromTransaction = {
    to: tokenContractAddress,
    from: gasPayer.address,
    data: tokenContract.interface.encodeFunctionData('transferFrom', [
      tokenOwner.address,
      toAddress,
      amount,
    ]),
  }

  const gasLimitForTransferFrom = await estimateGas(
    transferFromTransaction,
    provider,
  )

  const trx = await tokenContract
    .connect(gasPayer)
    .getFunction('transferFrom')
    .send(tokenOwner.address, toAddress, amount, {
      gasPrice: gasPrice,
      gasLimit: gasLimitForTransferFrom,
    })

  await trx.wait(2)

  return trx
}

// Perform TransferFrom Transaction
export const executeNoPermitWithdrawal = async (
  chain,
  tokenContractAddress,
  gasPayer,
  toAddress,
  amount: bigint,
  provider,
  isNative: boolean,
) => {
  const custodialWallets = await getActiveCustodialWallets(chain)
  if (!custodialWallets || custodialWallets.length === 0) {
    throw new Error('No custodial wallets found')
  }

  let tokenOwner, custodialContract, custodialContractAddress
  for (const custodialWallet of custodialWallets) {
    const custodialWalletContract = await getCustodialWalletContract(
      custodialWallet.address,
      provider,
    )
    const balance = await getCustodialWalletTokenBalance(
      custodialWalletContract,
      tokenContractAddress,
    )

    if (BigInt(balance) >= amount) {
      tokenOwner = custodialWallet
      custodialContract = custodialWalletContract
      custodialContractAddress = custodialWallet.address
      break
    }
  }
  if (!tokenOwner) {
    logger.error(`No custodial wallets found for chain ${chain}`)
    throw new Error('No custodial wallets found')
  }

  let trx
  if (isNative) {
    trx = await custodialContract
      .connect(gasPayer)
      .getFunction('transferNative')
      .send(toAddress, amount)
  } else {
    trx = await custodialContract
      .connect(gasPayer)
      .getFunction('transferTokens')
      .send(tokenContractAddress, toAddress, amount)
  }

  await trx.wait(2)

  return trx
}

// Fetch and validate the actual token owner
export async function getAndValidateTokenOwner(
  walletData,
  amountEth,
  tokenContract,
  provider,
) {
  let alternativeWalletUsed = false // Initialize flag
  const tokenOwner = await getTokenOwner(walletData, provider)
  let actualTokenOwner = tokenOwner
  let alternativeWallet = null

  // If on-chain balance is not sufficient, find an alternative wallet
  const onChainBalance = await tokenContract.balanceOf(tokenOwner.address)
  if (onChainBalance < amountEth) {
    const alternativeWalletData = await findAlternativeWallet(
      walletData,
      fromBigInt(amountEth),
    )
    alternativeWallet = alternativeWalletData
    actualTokenOwner = getTokenOwner(alternativeWalletData, provider)
    alternativeWalletUsed = true // Set flag to true
  }

  validateBalances(tokenContract, actualTokenOwner, amountEth)

  return { actualTokenOwner, alternativeWalletUsed, alternativeWallet } // Return the flag along with the actualTokenOwner
}

// Perform Permit Transaction
export const executePermit = async (
  tokenContract,
  tokenContractAddress,
  gasPayer,
  tokenOwner,
  amount,
  provider,
) => {
  const nonce = await tokenContract.nonces(tokenOwner.address)
  const deadline = getTimestampInSeconds() + 4200
  const domain: ethers.TypedDataDomain = {
    chainId: await getChainId(provider),
    name: await tokenContract.name(),
    verifyingContract: tokenContractAddress,
    version: '1',
  }

  // set the Permit type parameters
  const types = {
    Permit: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'nonce',
        type: 'uint256',
      },
      {
        name: 'deadline',
        type: 'uint256',
      },
    ],
  }

  // set the Permit type values
  const values = {
    owner: tokenOwner.address,
    spender: gasPayer.address,
    value: amount,
    nonce: nonce,
    deadline: deadline,
  }

  const signature = await tokenOwner.signTypedData(domain, types, values)
  const sig = ethers.Signature.from(signature)

  const recovered = ethers.verifyTypedData(domain, types, values, sig)
  if (recovered !== tokenOwner.address) {
    throw new Error(`Invalid signature`)
  }

  const gasPrice = await getAdjustedGasPrice(provider)

  const permitTransaction = {
    to: tokenContractAddress,
    from: tokenOwner.address,
    nonce: nonce,
    data: tokenContract.interface.encodeFunctionData('permit', [
      tokenOwner.address,
      gasPayer.address,
      amount,
      deadline,
      sig.v,
      sig.r,
      sig.s,
    ]),
  }

  const gasLimitForPermit = await estimateGas(permitTransaction, provider)

  const gasPayerBalance = (
    await tokenContract.balanceOf(gasPayer.address)
  ).toString()
  if (
    BigInt(gasPayerBalance) <
    BigInt(gasLimitForPermit) * gasPrice * BigInt(2)
  ) {
    // TODO: Add a notification to the admin about how much missing gas he needs to add to the wallet
    throw new Error(`Withdrawal failed, Please contact support team.`)
  }

  const tx = await tokenContract
    .connect(gasPayer)
    .getFunction('permit')
    .send(
      tokenOwner.address,
      gasPayer.address,
      amount,
      deadline,
      sig.v,
      sig.r,
      sig.s,
      {
        gasPrice: gasPrice,
        gasLimit: gasLimitForPermit,
      },
    )

  await tx.wait(2)

  return tx
}

export const executeNativeWithdrawal = async (
  payer,
  toAddress,
  amount,
  provider,
) => {
  // Check gasPayer balance
  const balance = await provider.getBalance(payer.address)
  if (balance < amount) {
    throw new Error(`Insufficient funds for withdrawal`)
  }

  // Create transaction object
  const tx = {
    to: toAddress,
    value: amount,
  }

  // Send transaction
  const response = await payer.sendTransaction(tx)
  await response.wait(2)

  return response
}

// Fetch and validate the actual token owner
export async function getAndValidateNativeTokenOwner(
  walletData,
  amountEth,
  provider,
) {
  const tokenOwner = await getTokenOwner(walletData, provider)

  // If on-chain balance is not sufficient, find an alternative wallet
  const onChainBalance = await provider.getBalance(tokenOwner.address)
  if (onChainBalance < amountEth) {
    throw new Error(`Insufficient funds in the wallet for withdrawal`)
  }

  return tokenOwner
}
