// auth.ts

import { createError } from '.'
import { getRolesAndPermissionsCache } from './roles'
import {
  createSession,
  findSession,
  generateAccessToken,
  generateCsrfToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './token'

const AUTH_PAGES = ['/api/auth', '/api/profile']
const isDemo = Boolean(process.env.APP_DEMO === 'true')

// Validates the user and their permissions
export const validateUserAndPermissions = async (
  req: any,
  route: any,
  isGuest: boolean,
): Promise<any> => {
  if (isGuest) return

  const { permission } = route
  const method = route.method.toLowerCase()

  // Validate access token and possibly refresh it
  const decodedUserData = await verifyAndRefreshToken(req)

  // Validate CSRF token and session
  await validateCsrfAndSession(req, decodedUserData)

  // Check for demo mode restrictions
  if (
    ['post', 'put', 'del'].includes(method) &&
    isDemo &&
    !AUTH_PAGES.some((authPage) => route.path.startsWith(authPage))
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You cannot perform this action in demo mode',
    })
  }

  // Validate user permissions
  if (permission && decodedUserData) {
    const rolesAndPermissions = getRolesAndPermissionsCache()
    const userRole = rolesAndPermissions[decodedUserData?.role]
    if (
      !userRole ||
      (!userRole.permissions.includes(permission) &&
        userRole.name !== 'Super Admin')
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - You do not have permission to access this',
      })
    }
  }

  req.user = decodedUserData
}

// Helper function to verify and refresh access tokens
async function verifyAndRefreshToken(req: any): Promise<any> {
  const decodedUserData = await verifyAccessToken(req.tokens['access-token'])
  if (decodedUserData) return decodedUserData

  const refreshToken = req.tokens['refresh-token']
  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Missing refresh token',
    })
  }

  if (typeof refreshToken !== 'string') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - refresh token is not a string',
    })
  }

  const decodedRefreshToken = await verifyRefreshToken(refreshToken)
  if (!decodedRefreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid refresh token',
    })
  }

  const newAccessToken = generateAccessToken(decodedRefreshToken)
  req.tokens['access-token'] = `Bearer ${newAccessToken}`
  return decodedRefreshToken
}

// Helper function to validate CSRF and session
async function validateCsrfAndSession(
  req: any,
  decodedRefreshToken: any,
): Promise<void> {
  const session = await findSession(req.tokens['session-id'])
  const csrfToken = req.tokens['csrf-token']
  if (session && csrfToken && session.csrf_token === csrfToken) return

  if (!decodedRefreshToken.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid session',
    })
  }

  const newCsrfToken = generateCsrfToken()
  req.tokens['csrf-token'] = newCsrfToken

  const updatedSession = await createSession(
    decodedRefreshToken.id,
    req.tokens['access-token'],
    newCsrfToken,
  )
  req.tokens['session-id'] = updatedSession.sid
}

// Validates the content type of the request
export const validateContentType = (req: any, route: any): void => {
  if (!route.contentType) return

  const actualContentType = req.headers['content-type']
  if (!actualContentType.startsWith(route.contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Missing Content-Type',
    })
  }
}

// Updated function to prevent duplicate "Bearer" in cookies
export function writeSecureCookies(res, req) {
  // Precomputed common expiration times
  const fifteenMinutes = 15 * 60 * 1000
  const fourteenDays = 14 * 24 * 60 * 60 * 1000
  const oneDay = 1 * 24 * 60 * 60 * 1000

  const commonExpiration = {
    'access-token': new Date(Date.now() + fifteenMinutes).toUTCString(),
    'refresh-token': new Date(Date.now() + fourteenDays).toUTCString(),
    'session-id': new Date(Date.now() + fourteenDays).toUTCString(),
    'csrf-token': new Date(Date.now() + oneDay).toUTCString(),
  }

  for (const [key, value] of Object.entries(req.tokens)) {
    // Skip if the token key is not in commonExpiration
    if (!commonExpiration.hasOwnProperty(key) || typeof value !== 'string')
      continue

    // Initialize tokenValue with the existing value
    let tokenValue = value.trim()

    // Add "Bearer" only if it's not already there, value is a string,
    // and the token is not a CSRF token
    if (
      typeof value === 'string' &&
      key.includes('token') &&
      key !== 'csrf-token' &&
      !value.startsWith('Bearer ')
    ) {
      tokenValue = `Bearer ${value}`
    }

    // Start building cookie options
    let cookieOptions = 'Path=/; '

    // Add expiration only if it's not an access-token
    if (key !== 'access-token' && commonExpiration[key]) {
      cookieOptions += `Expires=${commonExpiration[key]}; `
    }

    // Platform-specific header writing
    if (req.platform === 'app') {
      res.writeHeader(key, tokenValue)
    } else {
      if (req.platform === 'browser' && process.env.NODE_ENV === 'production') {
        cookieOptions += 'Secure; SameSite=None'
      }
      res.writeHeader('Set-Cookie', `${key}=${tokenValue}; ${cookieOptions}`)
    }
  }
}

export function deleteSecureCookies(res) {
  const cookieOptions = 'Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;'
  res.writeHeader('Set-Cookie', `access-token=; ${cookieOptions}`)
  res.writeHeader('Set-Cookie', `refresh-token=; ${cookieOptions}`)
  res.writeHeader('Set-Cookie', `session-id=; ${cookieOptions}`)
  res.writeHeader('Set-Cookie', `csrf-token=; ${cookieOptions}`)
}
