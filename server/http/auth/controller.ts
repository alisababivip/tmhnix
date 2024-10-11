// ./http/auth/controller.ts
import { randomBytes } from 'crypto'
import { ethers } from 'ethers'
import { handleController } from '../../utils'
import {
  getUserById,
  loginUser,
  loginUserChat,
  loginUserWithWallet,
  logoutUser,
  registerUser,
  resendOtp,
  resetPasswordQuery,
  sendEmailVerificationToken,
  updateUserQuery,
  verifyEmailTokenQuery,
  verifyLoginOTP,
  verifyPasswordResetQuery,
} from './queries'

export const controllers = {
  register: handleController(async (_, __, ___, query, body) => {
    const { first_name, last_name, email, password, ref } = body
    return await registerUser(first_name, last_name, email, password, ref)
  }),
  login: handleController(async (_, __, ___, ____, body) => {
    return await loginUser(body.email, body.password)
  }),
  loginChat: handleController(async (_, __, ___, query) => {
    const { first_name, last_name, email, password } = query
    return await loginUserChat(email, password, first_name, last_name)
  }),
  loginOtp: handleController(async (_, __, ___, ____, body) => {
    return await verifyLoginOTP(body.uuid, body.otp)
  }),
  resendOtp: handleController(async (_, __, ___, ____, body) => {
    return await resendOtp(body.uuid, body.secret)
  }),
  profile: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return await getUserById(user.id)
  }),
  update: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    const {
      first_name,
      last_name,
      email,
      metadata,
      avatar,
      current_password,
      new_password,
    } = body
    return await updateUserQuery(
      user.id,
      first_name,
      last_name,
      email,
      metadata,
      avatar,
      current_password,
      new_password,
    )
  }),
  resetPassword: handleController(async (_, __, ___, ____, body) => {
    return await resetPasswordQuery(body.email)
  }),
  verifyResetPassword: handleController(async (_, __, ___, ____, body) => {
    return await verifyPasswordResetQuery(body.token)
  }),
  sendEmailVerification: handleController(
    async (_, __, ___, ____, body, user) => {
      if (!user) throw new Error('User not found')
      const { email } = body
      return await sendEmailVerificationToken(user.id, email)
    },
  ),
  verifyEmail: handleController(async (_, __, ___, ____, body) => {
    return await verifyEmailTokenQuery(body.token)
  }),
  logout: handleController(async (_, req, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    return await logoutUser(req, user.id)
  }),
  loginWithWallet: handleController(async (_, __, ___, ____, body) => {
    const { walletAddress } = body
    return await loginUserWithWallet(walletAddress)
  }),
  generateNonce: handleController(async (_, __, ___, ____, _____) => {
    // Implement your logic to generate a nonce
    const nonce = randomBytes(16).toString('hex')
    return { nonce }
  }),
  verifyMessage: handleController(async (_, __, ___, ____, body) => {
    const { message, signature, walletAddress } = body
    const isVerified = await verifySignature(message, signature, walletAddress)

    if (!isVerified) throw new Error('Signature verification failed')

    return await loginUserWithWallet(walletAddress)
  }),
}

export const verifySignature = async (
  message: string,
  signature: string,
  expectedAddress: string,
) => {
  try {
    // In v6, we use the Signature class for signature operations
    const sig = ethers.Signature.from(signature)
    const messageHash = ethers.hashMessage(message)
    const recoveredAddress = ethers.recoverAddress(messageHash, sig)

    return recoveredAddress === expectedAddress
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}
