// utils.ts
import * as zlib from 'zlib'
import type { RequestContext } from '../types'
import { calculateParamIndices, extractData } from './extract'
import { validateUserAndPermissions, writeSecureCookies } from './middleware'

const commonHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'no-referrer-when-downgrade',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

export const setCORSHeaders = (res) => {
  res.writeHeader(
    'Access-Control-Allow-Origin',
    process.env.APP_PUBLIC_URL + ':3000',
  )
  res.writeHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.writeHeader(
    'Access-Control-Allow-Headers',
    '*, client-platform, access-token, refresh-token, session-id, csrf-token, content-type',
  )
  res.writeHeader('Access-Control-Allow-Credentials', 'true')
}

export function sendResponse(
  res,
  status: 'success' | 'fail',
  data: any,
  message?: string,
  error?: any,
  req?: any,
) {
  if (res.aborted) {
    return
  }
  if (!res.abortedHandlerAttached) {
    res.onAborted(() => {
      res.aborted = true
    })
    res.abortedHandlerAttached = true
  }

  let response

  if (status === 'success') {
    response = {
      status: 'success',
      data: {
        result: data || null,
        message: message || data?.message || null,
      },
    }
  } else {
    response = {
      status: 'fail',
      error: error,
    }
  }

  const responseStr = JSON.stringify(response)

  // Compress the JSON string using Gzip
  zlib.gzip(responseStr, (err, buffer) => {
    if (err) {
      console.error('Error compressing response:', err)
      return
    }

    res.cork(() => {
      if (res.aborted) {
        return
      }

      // Set CORS headers
      setCORSHeaders(res)

      // Set common headers
      for (const [key, value] of Object.entries(commonHeaders)) {
        res.writeHeader(key, value)
      }

      // Write secure cookies if applicable
      if (
        req &&
        Object.keys(req.tokens).length > 0 &&
        req.url.startsWith('/api/auth')
      ) {
        writeSecureCookies(res, req)
      }

      // Set Content-Encoding header to indicate Gzip compression
      res.writeHeader('Content-Encoding', 'gzip')

      // Send the compressed buffer
      res.end(buffer)
    })
  })
}

// Function to setup the route handler
export const setupRouteHandler = (route: any, controllers: any) => {
  const paramIndices = calculateParamIndices(route.path) // Calculate once, outside of the function

  return async (res: any, req: any) => {
    // Handle aborted requests
    res.onAborted(() => {
      res.aborted = true
    })

    // Initialize request context
    const context: RequestContext = {
      originalReq: req,
      user: null,
      tokens: {},
      headers: [],
      platform: null,
      url: req.getUrl(),
      method: route.method === 'del' ? 'DELETE' : route.method.toUpperCase(),
    }

    // Check if route allows guest access
    const isGuest = route.isGuest ?? false

    try {
      // Extract required data from the request
      const { params, query, body, error } = await extractData(
        route.method.toLowerCase(),
        route,
        res,
        req,
        context,
        paramIndices,
      )

      // If data extraction resulted in an error, throw it
      if (error) throw error

      // Validate user and permissions
      await validateUserAndPermissions(context, route, isGuest)

      // Retrieve and invoke the controller function
      const controllerFn = controllers[route.controller]
      if (typeof controllerFn === 'function') {
        try {
          await controllerFn(res, context, params, query, body)
        } catch (e) {
          console.error('Error invoking controller:', e)
          sendResponse(
            res,
            'fail',
            null,
            'An unexpected error occurred',
            { status: 500, message: 'Controller not found' },
            context,
          )
        }
      } else {
        console.error(`Controller function of ${route.controller}: Not found`)
        sendResponse(
          res,
          'fail',
          null,
          'An unexpected error occurred',
          { status: 500, message: 'Controller not found' },
          context,
        )
      }
    } catch (error) {
      sendResponse(
        res,
        'fail',
        null,
        error.message,
        {
          status: error.statusCode || 400,
          message: error.message,
        },
        context,
      )
      return
    }
  }
}

const handleCookies = (data: any, req: RequestContext) => {
  const { cookies, message, ...restData } = data
  if (req.tokens) {
    req.tokens = {
      ...req.tokens,
      'access-token': cookies['access-token'],
      'refresh-token': cookies['refresh-token'],
      'session-id': cookies['session-id'],
      'csrf-token': cookies['csrf-token'],
    }
  }
  return { restData, message }
}

const handleResponse = (res: any, data: any, req?: RequestContext) => {
  if (data.cookies && req?.tokens) {
    const { restData, message } = handleCookies(data, req)
    sendResponse(res, 'success', restData, message, null, req)
  } else if (data.message) {
    const { message, ...restData } = data
    sendResponse(res, 'success', restData, message, null, req)
  } else {
    sendResponse(res, 'success', data, 'Operation successful', null, req)
  }
}

export const handleController =
  (action) =>
  async (res: any, req: RequestContext, params: any, query: any, body: any) => {
    try {
      const data = await action(res, req, params, query, body, req.user)
      if (data) {
        handleResponse(res, data, req)
      } else {
        sendResponse(res, 'success', null, 'Operation successful', null, req)
      }
    } catch (error) {
      const status = error instanceof CustomError ? error.statusCode : 500
      const message =
        error instanceof CustomError
          ? error.statusMessage
          : 'An unexpected error occurred'
      sendResponse(
        res,
        'fail',
        null,
        message,
        {
          status,
          message: error.message,
        },
        req,
      )
    }
  }

interface ErrorOptions {
  statusCode: number
  statusMessage: string
}

class CustomError extends Error {
  statusCode: number
  statusMessage: string

  constructor({ statusCode, statusMessage }: ErrorOptions) {
    super(statusMessage)
    this.statusCode = statusCode
    this.statusMessage = statusMessage

    // This ensures that the CustomError is an instance of Error, which is important for proper error handling
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function createError(options: ErrorOptions): CustomError {
  return new CustomError(options)
}

export const validAddonFolders = [
  'ai-trading',
  'ecommerce',
  'ecosystem',
  'faq',
  'forex',
  'ico',
  'mlm',
  'p2p',
  'staking',
  'mailwizard',
]
