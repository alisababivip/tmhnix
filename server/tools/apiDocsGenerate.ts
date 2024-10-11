import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { routeGroups as coreRouteGroups } from '~~/routes'
import { validAddonFolders } from '~~/utils'

const isProduction = process.env.NODE_ENV === 'production'
const fileExtension = isProduction ? '.js' : '.ts'
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Define the extensions directory
const extensionsDir = path.resolve(
  process.cwd(),
  isProduction ? 'dist' : 'server',
  'extensions',
)
const rootPath = process.cwd()
const apiInfo = {
  title: `${process.env.APP_PUBLIC_SITE_NAME} API`,
  version: '1.0.2',
}

const paths = {}

const successResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        result: { type: 'object' },
        message: { type: 'string' },
      },
    },
  },
}

const failResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

const clientPlatformHeaderParam = {
  name: 'client-platform',
  in: 'header',
  required: true,
  schema: { type: 'string', default: 'app' },
  description: 'Client platform identifier',
}

const tags = []

// Function to process each route group
const extractRoutes = (routeGroups) => {
  routeGroups.forEach((group) => {
    if (group.basePath.startsWith('/api/admin')) {
      return
    }

    if (group.basePath.startsWith('/api/exchange/settings')) {
      return
    }

    if (group.basePath.startsWith('/api/cron')) {
      return
    }

    const tagParts = group.basePath.split('/').filter(Boolean).slice(1)
    const tagName = tagParts.map(capitalize).join(' ')

    // Add the tag to the tags array if it's not already included
    if (!tags.find((t) => t.name === tagName)) {
      tags.push({
        name: tagName,
        description: `Operations for ${tagName}`,
      })
    }

    group.routes.forEach((route) => {
      if (route.permission) {
        return
      }
      const httpMethod = route.method === 'del' ? 'delete' : route.method
      let fullPath = `${group.basePath}${route.path}`

      // Replace ':' with '{}' for path parameters
      fullPath = fullPath.replace(/:([^\/]+)/g, '{$1}')

      if (!paths[fullPath]) {
        paths[fullPath] = {}
      }

      // Parameters for path and query
      const parameters = []
      parameters.push(clientPlatformHeaderParam)

      if (route.params) {
        route.params.forEach((param) => {
          parameters.push({
            name: param.replace('?', ''),
            in: 'path',
            required: !param.startsWith('?'),
            schema: { type: 'string' },
          })
        })
      }
      if (route.query) {
        route.query.forEach((queryParam) => {
          parameters.push({
            name: queryParam.replace('?', ''),
            in: 'query',
            required: !queryParam.startsWith('?'),
            schema: { type: 'string' },
          })
        })
      }

      // Request body configuration
      let requestBody
      if (route.body) {
        requestBody = {
          required: route.body.some((key) => !key.startsWith('?')),
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: Object.fromEntries(
                  route.body.map((key) => [
                    key.replace('?', ''),
                    { type: 'string' },
                  ]),
                ),
              },
            },
          },
        }
      }

      paths[fullPath][httpMethod] = {
        tags: [tagName],
        summary: route.controller,
        parameters,
        requestBody,
        responses: {
          '200': {
            description: 'Success',
            content: { 'application/json': { schema: successResponseSchema } },
          },
          '400': {
            description: 'Bad Request',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '404': {
            description: 'Not Found',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '500': {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: failResponseSchema } },
          },
        },
      }
    })
  })
}

// Extract routes from core
extractRoutes(coreRouteGroups)

// Extract routes from each extension and add to documentation
validAddonFolders.forEach((extension) => {
  try {
    const extensionRoutesPath = path.resolve(
      extensionsDir,
      extension,
      `routes${fileExtension}`,
    )
    if (fs.existsSync(extensionRoutesPath)) {
      const extensionRoutes = require(extensionRoutesPath).default
      extractRoutes(extensionRoutes)
    } else {
      console.warn(`No routes.ts found for extension ${extension}`)
    }
  } catch (error) {
    console.error(`Error reading routes for extension ${extension}: ${error}`)
  }
})

const swaggerObject = {
  openapi: '3.0.0',
  info: apiInfo,
  paths,
}

const swaggerYaml = yaml.dump(swaggerObject)

fs.writeFileSync(`${rootPath}/api.yaml`, swaggerYaml)
