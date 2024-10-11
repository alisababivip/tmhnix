import fs from 'fs'
import path from 'path'
import { routeGroups as coreRouteGroups } from '~~/routes' // Replace with your actual core routes
import { validAddonFolders } from '~~/utils'

// Initialize an empty permissions array
const permissions: string[] = []
const rootPath = path.resolve(process.cwd(), 'prisma', 'seed')

// Function to extract permissions from route groups
const extractPermissions = (routeGroups: any) => {
  if (!routeGroups) {
    console.warn('No route groups found')
    return
  }
  routeGroups.forEach((group: any) => {
    if (!group.routes) {
      console.warn('No routes found in group')
      return
    }
    group.routes.forEach((route: any) => {
      if (route.permission && !permissions.includes(route.permission)) {
        console.log(`New permission added: ${route.permission}`)
        permissions.push(route.permission)
      }
    })
  })
}

// Extract permissions from core routes
extractPermissions(coreRouteGroups)

// Define the extensions directory
const extensionsDir = path.resolve(process.cwd(), 'server', 'extensions')

// Read the list of extensions
let extensionNames: string[]
try {
  extensionNames = fs.readdirSync(extensionsDir)
} catch (error) {
  console.error(`Error reading extensions directory: ${error}`)
  extensionNames = []
}

// Extract permissions from each extension's routes
validAddonFolders.forEach((extension) => {
  try {
    const extensionRoutesPath = path.resolve(
      extensionsDir,
      extension,
      `routes.ts`,
    )
    if (fs.existsSync(extensionRoutesPath)) {
      const extensionRoutes = require(extensionRoutesPath).default
      extractPermissions(extensionRoutes)
    } else {
      console.warn(`No routes.ts found for extension ${extension}`)
    }
  } catch (error) {
    console.error(`Error reading routes for extension ${extension}: ${error}`)
  }
})

// Convert array to JSON string
const permissionsJSON = JSON.stringify(permissions, null, 2)

// Write to a file
fs.writeFileSync(path.resolve(rootPath, 'permissions.json'), permissionsJSON)

console.log('Permissions JSON file has been generated.')
