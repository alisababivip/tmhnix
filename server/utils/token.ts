import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import type { RefreshTokens, Session } from '../types'
import { makeUuid } from './passwords'
import prisma from './prisma'

const APP_ACCESS_TOKEN_SECRET = process.env.APP_ACCESS_TOKEN_SECRET || 'secret'
const APP_REFRESH_TOKEN_SECRET =
  process.env.APP_REFRESH_TOKEN_SECRET || 'secret'
const APP_RESET_TOKEN_SECRET = process.env.APP_RESET_TOKEN_SECRET || 'secret'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '14d'
const JWT_RESET_EXPIRY = process.env.JWT_RESET_EXPIRY || '1h'

// Generate Access Token
export const generateAccessToken = (user: any): string => {
  return jwt.sign({ id: user.id, role: user.role }, APP_ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'platform',
    jwtid: makeUuid(),
  })
}

// Generate Refresh Token
export const generateRefreshToken = (user: any): string => {
  return jwt.sign({ id: user.id, role: user.role }, APP_REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'platform',
    jwtid: makeUuid(),
  })
}

// Generate Reset Token
export const generateResetToken = (user: any): string => {
  return jwt.sign(user, APP_RESET_TOKEN_SECRET, {
    expiresIn: JWT_RESET_EXPIRY,
    issuer: 'platform',
    jwtid: makeUuid(),
  })
}

export const generateEmailToken = (user: any): string => {
  return jwt.sign(user, APP_RESET_TOKEN_SECRET, {
    expiresIn: '1d',
    issuer: 'platform',
    jwtid: makeUuid(),
  })
}

// Generate CSRF Token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// Verify Access Token
export const verifyAccessToken = (token: string): any => {
  if (!token || !token.includes(' ')) {
    return null
  }
  const cookieToken = token.split(' ')[1]
  try {
    return jwt.verify(cookieToken, APP_ACCESS_TOKEN_SECRET)
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    return null
  }
}

// Verify Refresh Token
export const verifyRefreshToken = (token: string): any => {
  if (!token || !token.includes(' ')) {
    return null
  }
  const cookieToken = token.split(' ')[1]
  try {
    return jwt.verify(cookieToken, APP_REFRESH_TOKEN_SECRET)
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    return null
  }
}

//  Verify Reset Token
export const verifyResetToken = (token: string): any => {
  try {
    return jwt.verify(token, APP_RESET_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

//  Verify Email Token
export const verifyEmailToken = (token: string): any => {
  try {
    return jwt.verify(token, APP_RESET_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

// Stores a refresh token for a user
export const storeRefreshToken = async (
  userId: number,
  token: string,
): Promise<RefreshTokens> => {
  try {
    // Transaction to ensure atomicity
    return await prisma.$transaction(async (prisma) => {
      // Delete all existing refresh tokens for the user
      await prisma.refreshtokens.deleteMany({
        where: { user_id: userId },
      })

      // Store the new refresh token
      return prisma.refreshtokens.create({
        data: {
          user_id: userId,
          token_id: token,
          is_active: true,
        },
      }) as unknown as RefreshTokens
    })
  } catch (error) {
    if (error.code === 'P2002') {
      console.error(
        `Unique constraint error for userId ${userId}: ${error.meta.target}`,
      )
    } else {
      console.error('An unexpected error occurred:', error)
    }
    throw error
  }
}

// Deletes all refresh tokens for a user
export const deleteAllRefreshTokens = async (userId: number) => {
  await prisma.refreshtokens.deleteMany({
    where: { user_id: userId },
  })
}

// Deactivates all refresh tokens if a refresh token is stolen
export const findActiveRefreshToken = async (
  userId: number,
): Promise<RefreshTokens | null> => {
  return prisma.refreshtokens.findFirst({
    where: {
      user_id: userId,
      is_active: true,
    },
  }) as unknown as RefreshTokens
}

// Deactivates all refresh tokens if a refresh token is stolen
export const deactivateAllTokensIfStolen = async (
  userId: number,
  incomingToken: string,
): Promise<boolean> => {
  const foundToken = await prisma.refreshtokens.findFirst({
    where: {
      user_id: userId,
      token_id: incomingToken,
      is_active: false,
    },
  })

  if (foundToken) {
    await deleteAllRefreshTokens(userId)
    return true
  }

  return false
}

// Finds an active refresh token for a user
export const getRefreshTokenRecord = async (token: string) => {
  return prisma.refreshtokens.findUnique({
    where: { token_id: token },
  })
}

// Creates a new session for a user
export const createSession = async (
  userId: number,
  accessToken: string,
  csrfToken: string,
): Promise<Session> => {
  try {
    return await prisma.$transaction(async (prisma) => {
      // Delete all existing sessions for the user
      await prisma.session.deleteMany({
        where: { user_id: userId },
      })

      // Create a new session
      return prisma.session.create({
        data: {
          user_id: userId,
          sid: makeUuid(),
          access_token: accessToken,
          csrf_token: csrfToken,
          is_active: true,
          ip_address: '',
        },
      }) as unknown as Session
    })
  } catch (error) {
    throw error
  }
}

// Deletes all sessions for a user
export const deleteAllSessions = async (userId: number) => {
  await prisma.session.deleteMany({
    where: { user_id: userId },
  })
}

// Finds an active session for a user
export const findActiveSession = async (
  userId: number,
  csrfToken: string,
): Promise<Session | null> => {
  return prisma.session.findFirst({
    where: {
      user_id: userId,
      csrf_token: csrfToken,
      is_active: true,
    },
  })
}

export const findSession = async (sessionId: string) => {
  if (!sessionId) throw new Error('Session ID is required')
  try {
    return prisma.session.findUnique({
      where: { sid: sessionId },
    })
  } catch (error) {
    throw new Error(error.message)
  }
}

// Validate CSRF Session Token
export async function validateCsrfSessionToken(
  sessionId: string,
  csrfToken: string,
) {
  return await prisma.session.findFirst({
    where: {
      sid: sessionId,
      csrf_token: csrfToken,
      is_active: true,
    },
  })
}

// Validate CSRF Token
export const validateCsrfToken = async (
  sessionId: string,
  csrfToken: string,
): Promise<boolean> => {
  const session = await prisma.session.findFirst({
    where: {
      sid: sessionId,
      csrf_token: csrfToken,
      is_active: true,
    },
  })

  if (session) {
    return true
  }
  return false
}
