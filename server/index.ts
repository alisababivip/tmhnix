import * as fs from 'fs'
import * as path from 'path'
import * as tsconfigPaths from 'tsconfig-paths'
import * as uWS from 'uWebSockets.js'
import { setupExchangeWebsocket } from './exchange'
import { createLogger } from './logger'
import { routeGroups } from './routes'
import { setupApiDocsRoutes } from './tools/apiDocsSetup'
import { setupChat } from './tools/chat'
import { setupHtmlRoutes } from './tools/htmlSetup'
import { setCORSHeaders, setupRouteHandler, validAddonFolders } from './utils'

const logger = createLogger('uWS-Server')
const app = uWS.App()
const isProduction = process.env.NODE_ENV === 'production'
const fileExtension = isProduction ? '.js' : '.ts'
const baseUrl = path.join(process.cwd(), isProduction ? '/dist' : '/server')
const routeHandlerCache = new Map<string, any>()

const cleanup = tsconfigPaths.register({
  baseUrl,
  paths: { '~~/*': ['./*'] },
})

import './tools/apiDocsGenerate'
// import './tools/permissionsGenerate'

const isValidMethod = (method: string) => typeof app[method] === 'function'

const setupIndividualRoute = (
  basePath: string,
  route: any,
  controllers: any,
) => {
  if (isValidMethod(route.method)) {
    const fullPath = `${basePath}${route.path}`
    app[route.method](fullPath, setupRouteHandler(route, controllers))
  } else {
    logger.error(`Invalid method ${route.method} for route ${route.path}`)
  }
}

const getValidAddonFolders = () => {
  return validAddonFolders.filter((folderName) => {
    const fullPath = path.join(baseUrl, 'extensions', folderName)
    return fs.existsSync(fullPath)
  })
}

const setupRouteGroup = async (group: any) => {
  const { basePath, routes, controllerPath } = group
  const fullControllerPath = path.resolve(
    baseUrl,
    `${controllerPath}${fileExtension}`,
  )

  if (routeHandlerCache.has(fullControllerPath)) {
    const controllers = routeHandlerCache.get(fullControllerPath)
    routes.forEach((route) =>
      setupIndividualRoute(basePath, route, controllers),
    )
    return
  }

  if (!fs.existsSync(fullControllerPath)) {
    logger.error(`Controller file does not exist: ${fullControllerPath}`)
    return
  }

  try {
    const mod = await import(fullControllerPath)
    const controllers = mod.controllers
    routeHandlerCache.set(fullControllerPath, controllers)

    routes.forEach((route) =>
      setupIndividualRoute(basePath, route, controllers),
    )
  } catch (error) {
    logger.error(
      `Failed to import controllers from ${fullControllerPath}: ${error}`,
    )
  }
}

const setupRoutes = async () => {
  console.time('SetupRoutes Duration')
  const addonFolders = getValidAddonFolders()

  const setupPromises = routeGroups.map(setupRouteGroup)
  addonFolders.forEach((folder) => {
    const addonRoutePath = `${baseUrl}/extensions/${folder}/routes${fileExtension}`
    try {
      const addonRouteGroups = require(addonRoutePath).default
      setupPromises.push(...addonRouteGroups.map(setupRouteGroup))
    } catch (error) {
      logger.error(
        `Failed to import addon routes from ${addonRoutePath}: ${error}`,
      )
    }
  })

  await Promise.all(setupPromises)
  console.timeEnd('SetupRoutes Duration')
}

const setupEcosystemWebsocketIfAvailable = async () => {
  const filePath = path.join(
    __dirname,
    'extensions',
    'ecosystem',
    'websocket',
    `index${fileExtension}`,
  ) // Adjust the path as needed

  if (fs.existsSync(filePath)) {
    try {
      // Using a variable to make TypeScript treat this as a dynamic import
      const moduleName = `./extensions/ecosystem/websocket${
        process.env.NODE_ENV === 'production' ? '/index.js' : ''
      }`
      const ecosystemModule = await import(moduleName)
      if (
        ecosystemModule &&
        typeof ecosystemModule.setupEcosystemWebsocket === 'function'
      ) {
        ecosystemModule.setupEcosystemWebsocket(app)
      }
    } catch (error) {
      console.log('Ecosystem websocket setup failed:', error)
    }
  } else {
    console.log('Ecosystem websocket module does not exist.')
  }
}

// Handle OPTIONS for all routes
app.options('/*', (res, req) => {
  res.cork(() => {
    setCORSHeaders(res)
    res.writeStatus('204 No Content')
    res.end()
  })
})

const initializeApp = async () => {
  try {
    setupApiDocsRoutes(app)
    setupHtmlRoutes(app)
    setupExchangeWebsocket(app)
    setupChat(app)
    await setupEcosystemWebsocketIfAvailable()
    await setupRoutes()

    app.listen(4000, (token) => {
      if (token) {
        logger.info('Server started on port 4000')
      } else {
        logger.error('Failed to start server')
      }
    })
  } catch (error) {
    logger.error(`Failed to initialize app: ${error}`)
    // Perform any necessary cleanup
    cleanup()
    process.exit(1) // Exit with error code
  }
}

initializeApp().catch((error) => {
  logger.error(`Failed to initialize app: ${error}`)
})

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

process.on('SIGINT', async () => {
  try {
    logger.info('Server is shutting down...')
    cleanup()
  } catch (error) {
    logger.error(`Error during shutdown: ${error}`)
  } finally {
    process.exit() // Exit after cleanup
  }
})
