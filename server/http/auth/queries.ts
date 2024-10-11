// ./http/auth/queries.ts
import { addMinutes } from 'date-fns'
import passwordGenerator from 'generate-password'
import { authenticator } from 'otplib'
import { handleReferralRegister } from '~~/utils/affiliate'
import { createError } from '../../utils'
import { sendEmail } from '../../utils/emails'
import {
  hashPassword,
  makeUuid,
  validatePassword,
  verifyPassword,
} from '../../utils/passwords'
import prisma from '../../utils/prisma'
import {
  createSession,
  deleteAllRefreshTokens,
  deleteAllSessions,
  generateAccessToken,
  generateCsrfToken,
  generateEmailToken,
  generateRefreshToken,
  generateResetToken,
  storeRefreshToken,
  verifyEmailToken,
  verifyResetToken,
} from '../../utils/token'

const APP_TWILIO_ACCOUNT_SID = process.env.APP_TWILIO_ACCOUNT_SID
const APP_TWILIO_AUTH_TOKEN = process.env.APP_TWILIO_AUTH_TOKEN
const APP_TWILIO_PHONE_NUMBER = process.env.APP_TWILIO_PHONE_NUMBER

const userInclude = {
  role: {
    include: {
      rolepermission: {
        include: {
          permission: true,
        },
      },
    },
  },
  twofactor: {
    select: {
      type: true,
      enabled: true,
    },
  },
  kyc: {
    select: {
      status: true,
      level: true,
    },
  },
  author: {
    select: {
      uuid: true,
      status: true,
    },
  },
}

// Login user with wallet and return token
export const loginUserWithWallet = async (walletAddress: string) => {
  let isNewUser = false

  let user = await prisma.user.findUnique({
    where: { wallet_address: walletAddress },
    include: {
      twofactor: true,
    },
  })

  if (!user) {
    const role = await prisma.role.findFirst({ where: { name: 'User' } })
    if (!role) throw new Error('Default role not found')

    user = (await prisma.user.create({
      data: {
        wallet_address: walletAddress,
        role: { connect: { id: role.id } },
      },
    })) as any
    isNewUser = true
  }

  const publicUser = {
    id: user.id,
    role: user.role_id,
  }

  const accessToken = generateAccessToken(publicUser)
  const refreshToken = generateRefreshToken(publicUser)
  const csrfToken = generateCsrfToken()

  const session = await createSession(user.id, accessToken, csrfToken)
  await storeRefreshToken(user.id, refreshToken)

  return {
    message: isNewUser
      ? 'New account created successfully'
      : 'You have been logged in successfully',
    cookies: {
      'access-token': accessToken,
      'refresh-token': refreshToken,
      'session-id': session.sid,
      'csrf-token': csrfToken,
    },
  }
}

// send email verification token
export const sendEmailVerificationToken = async (
  userId: number,
  email: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email, id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const token = generateEmailToken({
    user: {
      uuid: user.uuid,
    },
  })

  try {
    await sendEmail(
      {
        TO: user.email,
        FIRSTNAME: user.first_name,
        CREATED_AT: user.created_at,
        TOKEN: token,
      },
      'EmailVerification',
    )

    return {
      message: 'Email with verification instructions sent successfully',
    }
  } catch (error) {
    throw createError({
      statusMessage: error.message,
      statusCode: 500,
    })
  }
}

// verify email token
export const verifyEmailTokenQuery = async (token: string) => {
  const decodedToken = verifyEmailToken(token)

  if (!decodedToken) {
    throw new Error('Invalid token')
  }

  if (
    decodedToken.jti !== (await addOneTimeToken(decodedToken.jti, new Date()))
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }

  try {
    await prisma.user.update({
      where: {
        uuid: decodedToken.user.uuid,
      },
      data: {
        email_verified: true,
      },
    })

    return {
      message: 'Token verified successfully',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }
}

// Get user by wallet address
export const getUserByWalletAddress = async (walletAddress: string) => {
  const user = await prisma.user.findUnique({
    where: { wallet_address: walletAddress },
    include: userInclude,
  })
  user.password = undefined
  return user
}

// Register user and return token
export const registerUser = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  ref?: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('Email already in use')
  }

  if (!validatePassword(password)) {
    throw new Error('Invalid password format')
  }

  const hashedPassword = await hashPassword(password)

  const role = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  })

  const newUser = await prisma.user.create({
    data: {
      first_name,
      last_name,
      uuid: makeUuid(),
      email,
      password: hashedPassword,
      role: {
        connect: {
          id: role.id,
        },
      },
    },
  })

  if (ref) {
    console.log('ref', ref)

    await handleReferralRegister(ref, newUser.uuid)
  }

  const publicUser = {
    id: newUser.id,
    role: newUser.role_id,
  }

  const accessToken = generateAccessToken(publicUser)
  const refreshToken = generateRefreshToken(publicUser)
  const csrfToken = generateCsrfToken()

  const session = await createSession(newUser.id, accessToken, csrfToken)
  await storeRefreshToken(newUser.id, refreshToken)

  return {
    message: 'User created successfully',
    cookies: {
      'access-token': accessToken,
      'refresh-token': refreshToken,
      'session-id': session.sid,
      'csrf-token': csrfToken,
    },
  }
}

// Login user and return token
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      twofactor: true,
    },
  })
  if (!user) {
    throw new Error('User not found')
  }

  const isPasswordValid = await verifyPassword(user.password, password)
  if (!isPasswordValid) {
    await prisma.user.update({
      where: { email },
      data: {
        failed_login_attempts: user.failed_login_attempts + 1,
        last_failed_login: new Date(),
      },
    })
    throw new Error('Invalid password')
  }

  const blockedUntil = addMinutes(user.last_failed_login, 5)
  if (user.failed_login_attempts >= 5 && blockedUntil > new Date()) {
    throw new Error(
      'Too many failed login attempts, account is temporarily blocked for 5 minutes',
    )
  }

  await prisma.user.update({
    where: { email },
    data: {
      failed_login_attempts: 0,
      last_failed_login: null,
    },
  })

  const two_factor = await prisma.settings.findFirst({
    where: {
      key: 'two_factor',
    },
  })
  if (user.twofactor?.enabled && two_factor && two_factor.value === 'Enabled') {
    const type = user.twofactor?.type
    const otp = authenticator.generate(user.twofactor.secret)
    try {
      if (type === 'SMS') {
        const phoneNumber = user.phone

        try {
          const twilio = require('twilio')
          const twilioClient = twilio(
            APP_TWILIO_ACCOUNT_SID,
            APP_TWILIO_AUTH_TOKEN,
          )
          await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            from: APP_TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          })
        } catch (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.message,
          })
        }
      }
      return {
        twofactor: {
          enabled: true,
          type: user.twofactor.type,
          secret: user.twofactor.secret,
        },
        uuid: user.uuid,
        message: '2FA required',
      }
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }
  }

  const publicUser = {
    id: user.id,
    role: user.role_id,
  }

  const accessToken = generateAccessToken(publicUser)
  const refreshToken = generateRefreshToken(publicUser)
  const csrfToken = generateCsrfToken()

  const session = await createSession(user.id, accessToken, csrfToken)
  await storeRefreshToken(user.id, refreshToken)

  return {
    message: 'You have been logged in successfully',
    cookies: {
      'access-token': accessToken,
      'refresh-token': refreshToken,
      'session-id': session.sid,
      'csrf-token': csrfToken,
    },
  }
}

export const loginUserChat = async (
  email: string,
  password: string,
  first_name: string,
  last_name: string,
) => {
  // Validate input
  if (!validateEmail(email) || !validatePassword(password)) {
    throw new Error('Invalid email or password')
  }

  // Hash password
  const errorOrHashedPassword = await hashPassword(password)
  const hashedPassword = errorOrHashedPassword as string

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { twofactor: true },
  })

  if (!existingUser) {
    const role = await getOrCreateUserRole()
    const newUser = await createUser({
      first_name,
      last_name,
      email,
      hashedPassword,
      role,
    })
    return await createSessionAndReturnResponse(newUser)
  } else {
    await updateUser(existingUser.id, { first_name, last_name, hashedPassword })
    return await createSessionAndReturnResponse(existingUser)
  }
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  return emailRegex.test(email)
}

async function getOrCreateUserRole() {
  // Implementation for role retrieval/creation
  const role = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  })
  return role
}

async function createUser(userData) {
  // Implementation for creating a new user
  const newUser = await prisma.user.create({
    data: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      uuid: makeUuid(),
      email: userData.email,
      password: userData.hashedPassword,
      email_verified: true,
      role: {
        connect: {
          id: userData.role.id,
        },
      },
    },
  })
  return newUser
}

async function updateUser(userId, updateData) {
  // Implementation for updating an existing user
  await prisma.user.update({
    where: { id: userId },
    data: {
      first_name: updateData.first_name,
      last_name: updateData.last_name,
      password: updateData.hashedPassword,
      email_verified: true,
    },
  })
}

async function createSessionAndReturnResponse(user) {
  // Implementation for creating session, generating tokens, and returning response
  const publicUser = {
    id: user.id,
    role: user.role_id,
  }
  const accessToken = generateAccessToken(publicUser)
  const refreshToken = generateRefreshToken(publicUser)
  const csrfToken = generateCsrfToken()

  const session = await createSession(user.id, accessToken, csrfToken)
  await storeRefreshToken(user.id, refreshToken)

  return {
    message: 'You have been logged in successfully',
    cookies: {
      'access-token': accessToken,
      'refresh-token': refreshToken,
      'session-id': session.sid,
      'csrf-token': csrfToken,
    },
  }
}

export const verifyLoginOTP = async (uuid: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: {
      twofactor: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const isValid = await authenticator.verify({
    token: otp,
    secret: user.twofactor.secret,
  })

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid OTP',
    })
  }

  const publicUser = {
    id: user.id,
    role: user.role_id,
  }

  const accessToken = generateAccessToken(publicUser)
  const refreshToken = generateRefreshToken(publicUser)
  const csrfToken = generateCsrfToken()

  const session = await createSession(user.id, accessToken, csrfToken)
  await storeRefreshToken(user.id, refreshToken)

  return {
    message: 'You have been logged in successfully',
    cookies: {
      'access-token': accessToken,
      'refresh-token': refreshToken,
      'session-id': session.sid,
      'csrf-token': csrfToken,
    },
  }
}

export const resendOtp = async (uuid: string, secret: string) => {
  if (!uuid || !secret) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request',
    })
  }
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: {
      twofactor: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  if (user.twofactor?.secret !== secret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Request',
    })
  }

  const type = user.twofactor?.type
  const otp = authenticator.generate(user.twofactor.secret)
  try {
    if (type === 'SMS') {
      const phoneNumber = user.phone

      try {
        const twilio = require('twilio')
        const twilioClient = twilio(
          APP_TWILIO_ACCOUNT_SID,
          APP_TWILIO_AUTH_TOKEN,
        )
        await twilioClient.messages.create({
          body: `Your OTP is: ${otp}`,
          from: APP_TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        })
      } catch (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message,
        })
      }
    }
    return {
      message: 'OTP sent successfully',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
}

export const logoutUser = async (req, userId: number) => {
  await deleteAllRefreshTokens(userId)
  await deleteAllSessions(userId)
  req.user = null
  return {
    message: 'You have been logged out',
    cookies: {
      'access-token': '',
      'refresh-token': '',
      'session-id': '',
      'csrf-token': '',
    },
  }
}

export const updateUserQuery = async (
  id: number,
  first_name?: string,
  last_name?: string,
  email?: string,
  metadata?: any,
  avatar?: string | null,
  current_password?: string,
  new_password?: string,
) => {
  const updateData: {
    first_name?: string
    last_name?: string
    email?: string
    metadata?: any
    avatar?: string | null
    password?: string
    email_verified?: boolean
  } = {}

  // Only add fields to updateData if they are explicitly provided
  if (first_name !== undefined) updateData.first_name = first_name
  if (last_name !== undefined) updateData.last_name = last_name
  if (email !== undefined) updateData.email = email
  if (metadata !== undefined) updateData.metadata = metadata
  if (avatar !== undefined) updateData.avatar = avatar

  // Handle email uniqueness
  if (email) {
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUserWithEmail && existingUserWithEmail.id !== id) {
      throw new Error('Email already in use by another account')
    }

    updateData.email_verified = false
  }

  // Handle password update
  if (new_password && current_password) {
    if (!validatePassword(new_password)) {
      throw new Error('Invalid password format')
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await verifyPassword(
      user.password,
      current_password,
    )
    if (!isPasswordValid) {
      throw new Error('Invalid current password')
    }

    updateData.password = await hashPassword(new_password)
  } else if (new_password && !current_password) {
    throw new Error('Current password is required to set a new password')
  }

  // Perform the update
  await prisma.user.update({
    where: { id },
    data: updateData,
  })
}

// Reset password
export const resetPasswordQuery = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('User not found')
  }

  const resetToken = generateResetToken({
    user: {
      uuid: user.uuid,
    },
  })

  try {
    await sendEmail(
      {
        TO: user.email,
        FIRSTNAME: user.first_name,
        LAST_LOGIN: user.last_login,
        TOKEN: resetToken,
      },
      'PasswordReset',
    )

    return {
      message: 'Email with reset instructions sent successfully',
    }
  } catch (error) {
    throw createError({
      statusMessage: error.message,
      statusCode: 500,
    })
  }
}

// Verify password reset token
export const verifyPasswordResetQuery = async (token: string) => {
  const decodedToken = verifyResetToken(token)

  if (!decodedToken) {
    throw new Error('Invalid token')
  }

  if (
    decodedToken.jti !== (await addOneTimeToken(decodedToken.jti, new Date()))
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }

  try {
    const password = await generateNewPassword(decodedToken.user.uuid)

    return {
      message: 'Token verified successfully',
      password: password,
      cookies: {
        'access-token': '',
        'refresh-token': '',
        'session-id': '',
        'csrf-token': '',
      },
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate new password',
    })
  }
}

// Get user by ID
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  })
  user.password = undefined
  return user
}

export async function generateNewPassword(
  uuid: string,
): Promise<Error | string> {
  const error = null

  // Generate secure password consistent with password policy
  const password = passwordGenerator.generate({
    length: 20,
    numbers: true,
    symbols: true,
    strict: true,
  })

  // Check if password passes password policy
  const isValidPassword = validatePassword(password)
  if (!isValidPassword) {
    return createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }

  // Hash password
  const errorOrHashedPassword = await hashPassword(password)

  const hashedPassword = errorOrHashedPassword as string

  try {
    await prisma.user.update({
      where: {
        uuid: uuid,
      },
      data: {
        password: hashedPassword,
      },
    })
    return password
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }
}

export async function addOneTimeToken(
  tokenId: string,
  expiresAt: Date,
): Promise<Error | string> {
  try {
    await prisma.onetimetoken.create({
      data: {
        token_id: tokenId,
        expires_at: expiresAt,
      },
    })

    return tokenId
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error',
    })
  }
}
