// extract.ts

const clientPlatforms = new Set(['app', 'browser', 'browser-dev'])
import * as uWS from 'uWebSockets.js'

export const extractData = async (
  method: string,
  route: any,
  res: any,
  req: any,
  context: any,
  paramIndices: number[],
) => {
  try {
    context.platform = extractPlatform(req)
    context.contentType = req.getHeader('content-type') || 'application/json'
    context.tokens = extractTokens(req, context.platform)
    const params = extractParams(req, route, paramIndices)

    if (
      ['get', 'head'].includes(method) &&
      route.query &&
      route.query.length > 0
    ) {
      return {
        params,
        query: extractQuery(req, route.query),
        body: {},
        error: null,
      }
    } else if (
      ['post', 'put', 'del'].includes(method) &&
      route.body &&
      route.body.length > 0
    ) {
      return {
        params,
        query: {},
        body: await extractBody(res, route.body, context.contentType),
        error: null,
      }
    }

    return { params, query: {}, body: {}, error: null }
  } catch (error) {
    console.warn(
      `Failed to extract data: ${error.message} on ${route.path} ${method}`,
    )
    return { params: {}, query: {}, body: {}, error }
  }
}

const extractPlatform = (req: any) => {
  const platform = req.getHeader('client-platform') || 'browser'
  if (!clientPlatforms.has(platform)) {
    throw new Error(`Invalid client platform: ${platform}`)
  }
  return platform
}

const extractTokens = (req: any, platform: string) => {
  const tokens: { [key: string]: string } = {}
  if (platform === 'browser') {
    const cookies = req.getHeader('cookie')
    if (cookies) {
      cookies.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=')
        tokens[name] = value
      })
    }
  } else if (platform === 'app') {
    ;['access-token', 'refresh-token', 'session-id', 'csrf-token'].forEach(
      (tokenName) => {
        tokens[tokenName] = req.getHeader(tokenName)
      },
    )
  }
  return tokens
}

const extractParams = (req: any, route: any, paramIndices: number[]) => {
  const params = {}
  paramIndices.forEach((_, i) => {
    const paramValue = req.getParameter(i)
    const paramName = route.params[i]
    if (route.params.includes(paramName)) {
      params[paramName] = paramValue
    } else {
      throw new Error(`Unexpected parameter: ${paramName}`)
    }
  })
  return params
}

export const calculateParamIndices = (path: string): number[] => {
  const segments = path.split('/')
  const paramIndices = []
  segments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      paramIndices.push(index)
    }
  })
  return paramIndices
}

export function extractQuery(req, expectedQuery: string[]): any {
  const queryString = req.getQuery()
  const query = {}
  const requiredKeys = []
  const optionalKeys = []

  // Separate required and optional keys
  for (const key of expectedQuery) {
    if (key.startsWith('?')) {
      optionalKeys.push(key.substring(1))
    } else {
      requiredKeys.push(key)
    }
  }

  new URLSearchParams(queryString).forEach((value, key) => {
    if (requiredKeys.includes(key) || optionalKeys.includes(key)) {
      query[key] = value
    } else {
      throw new Error(`Unexpected query parameter: ${key}`)
    }
  })

  // Check for required keys and throw an error if not found
  for (const key of requiredKeys) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) {
      throw new Error(`Missing required query parameter: ${key}`)
    }
  }

  return query
}
export async function extractBody(res, expectedBody, contentType) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)

    res.onData((ab, isLast) => {
      const chunk = Buffer.from(ab)
      buffer = Buffer.concat([buffer, chunk])

      if (isLast) {
        try {
          let parsedBody
          if (contentType && contentType.includes('multipart/form-data')) {
            const data = uWS.getParts(buffer, contentType)
            parsedBody = filterBody(data, expectedBody)
          } else if (contentType && contentType.includes('application/json')) {
            parsedBody = buffer.length > 0 ? JSON.parse(buffer.toString()) : {}
            parsedBody = filterBody(parsedBody, expectedBody)
          } else {
            throw new Error(
              'Unsupported Content-Type or no Content-Type provided',
            )
          }
          resolve(parsedBody)
        } catch (error) {
          reject(new Error(`Failed to extract data: ${error.message}`))
        }
      }
    })
  })
}

function filterBody(body, expectedKeys) {
  const filteredBody = {}
  const requiredKeys = expectedKeys.filter((key) => !key.startsWith('?'))
  const optionalKeys = expectedKeys
    .filter((key) => key.startsWith('?'))
    .map((key) => key.substring(1))
  const missingKeys = []

  // Handle multipart/form-data (array of fields)
  if (Array.isArray(body)) {
    body.forEach((field) =>
      processFiles(field, filteredBody, requiredKeys, optionalKeys),
    )
  }
  // Handle typical JSON object
  else {
    Object.keys(body).forEach((key) => {
      if (requiredKeys.includes(key) || optionalKeys.includes(key)) {
        filteredBody[key] = body[key]
      }
    })
  }

  // Check for missing required keys
  requiredKeys.forEach((key) => {
    if (!filteredBody.hasOwnProperty(key)) {
      missingKeys.push(key)
    }
  })

  if (missingKeys.length > 0) {
    throw new Error(`Missing required parameters: ${missingKeys.join(', ')}`)
  }

  return filteredBody
}

function processFiles(field, filteredBody, requiredKeys, optionalKeys) {
  // Handle file fields separately
  if (field.name.startsWith('files[')) {
    if (field.data instanceof ArrayBuffer) {
      filteredBody['files'] = filteredBody['files'] || []
      filteredBody['files'].push({
        name: field.filename,
        data: Buffer.from(field.data),
        type: field.type,
      })
    }
  } else if (
    requiredKeys.includes(field.name) ||
    optionalKeys.includes(field.name)
  ) {
    // Convert ArrayBuffer to string for regular fields
    if (field.data instanceof ArrayBuffer) {
      filteredBody[field.name] = Buffer.from(field.data).toString()
    } else {
      filteredBody[field.name] = field.data
    }
  }
}
