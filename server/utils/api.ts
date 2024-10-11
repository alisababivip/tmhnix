import AdmZip from 'adm-zip'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import { pipeline } from 'stream/promises'
import { storeSystemReport, updateExtensionQuery } from './system'

import { createLogger } from '../logger'
const logger = createLogger('Api')

let cachedIP: string | null = null
let lastFetched: number | null = null
let nextVerificationDate: Date | null = null
const verificationPeriodDays = 3
const rootPath = process.cwd()

export async function getProduct(name: string): Promise<any> {
  try {
    const filePath = `${rootPath}/platform.json`
    const fileContent = await fs.readFile(filePath, 'utf8')
    const products = JSON.parse(fileContent)

    const product = products.find((item: any) => item.name === name)

    if (!product) {
      logger.error(`Product with name ${name} not found`)
      throw new Error(`Product with name ${name} not found`)
    }

    return product
  } catch (error) {
    logger.error(`Error getting product: ${error.message}`)
    throw new Error(error.message)
  }
}

export async function fetchPublicIp(): Promise<string | null> {
  try {
    // Assuming $fetch is a global fetch function
    const response = await fetch('https://api.ipify.org?format=json')
    const json = await response.json()
    return json.ip
  } catch (error) {
    logger.error(`Error fetching public IP: ${error.message}`)
    return null
  }
}

export async function getPublicIp(): Promise<string | null> {
  const now = Date.now()

  if (cachedIP && lastFetched && now - lastFetched < 60000) {
    // 1 minute cache
    return cachedIP
  }

  cachedIP = await fetchPublicIp()
  lastFetched = now
  return cachedIP
}

export async function callApi(
  method: string,
  url: string,
  data: any = null,
  filename?: string,
) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'LB-API-KEY': process.env.API_LICENSE_API_KEY,
      'LB-URL': process.env.APP_PUBLIC_URL,
      'LB-IP': await getPublicIp(),
      'LB-LANG': 'en',
    }

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: data,
      timeout: 30000, // 30 seconds
    })

    if (response.headers.get('content-type') === 'application/zip') {
      if (!filename) {
        throw new Error('Filename must be provided for zip content.')
      }

      const buffer: any = []
      await pipeline(response.body, async function* (source: any) {
        for await (const chunk of source) {
          buffer.push(chunk)
        }
      })
      const completeBuffer = Buffer.concat(buffer)

      const dirPath = `${rootPath}/updates`
      const filePath = `${dirPath}/${filename}.zip`

      // Ensure the directory exists
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(filePath, completeBuffer)

      return {
        status: 'success',
        type: 'zip',
        message: 'Update file downloaded successfully',
        path: filePath,
      }
    } else {
      const result = await response.json()
      if (response.status !== 200) {
        logger.error(`API call failed: ${result.message}`)
        throw new Error(result.message)
      }
      return result
    }
  } catch (error) {
    logger.error(`API call failed: ${error.message}`)
    throw new Error(error.message)
  }
}

export async function verifyLicense(
  productId: string,
  license?: string | null,
  client?: string | null,
  timeBasedCheck?: boolean,
): Promise<any> {
  const licenseFilePath = `${rootPath}/${productId}.lic`

  let data: any

  try {
    // Check if a license file exists
    const licenseFileContent = await fs.readFile(licenseFilePath, 'utf8')
    data = {
      product_id: productId,
      license_file: licenseFileContent,
      license_code: null,
      client_name: null,
    }
  } catch (err) {
    logger.error(`Error reading license file: ${err.message}`)
    // File does not exist or other error occurred
    data = {
      product_id: productId,
      license_file: null,
      license_code: license,
      client_name: client,
    }
  }

  if (timeBasedCheck && verificationPeriodDays > 0) {
    const today = new Date()
    if (nextVerificationDate && today < nextVerificationDate) {
      return { status: true, message: 'Verified from cache' }
    }
  }

  try {
    const response = await callApi(
      'POST',
      `${process.env.APP_LICENSE_API_URL}/api/verify_license`,
      JSON.stringify(data),
    )

    if (timeBasedCheck && verificationPeriodDays > 0 && response.status) {
      const today = new Date()
      nextVerificationDate = new Date()
      nextVerificationDate.setDate(today.getDate() + verificationPeriodDays)
    }

    if (!response.status) {
      logger.error(`License verification failed: ${response.message}`)
      throw new Error(response.message)
    }
    return {
      message: response.message,
    }
  } catch (error) {
    logger.error(`License verification failed: ${error.message}`)
    throw new Error(error.message)
  }
}

export async function activateLicense(
  productId: string,
  license: string,
  client: string,
): Promise<any> {
  const data = {
    product_id: productId,
    license_code: license,
    client_name: client,
    verify_type: 'envato',
  }

  try {
    const response = await callApi(
      'POST',
      `${process.env.APP_LICENSE_API_URL}/api/activate_license`,
      JSON.stringify(data),
    )

    if (!response.status) {
      logger.error(`License activation failed: ${response.message}`)
      throw new Error(response.message)
    }

    // If activation is successful, save the license
    if (response.lic_response) {
      const licFileContent = response.lic_response
      const licenseFilePath = `${rootPath}/${productId}.lic`

      // Save the license to a file in the root directory
      await fs.writeFile(licenseFilePath, licFileContent)
    }

    return {
      ...response,
      message: response.message,
    }
  } catch (error) {
    logger.error(`License activation failed: ${error.message}`)
    throw new Error(error.message)
  }
}

export async function checkLatestVersion(productId: string) {
  const payload = {
    product_id: productId,
  }
  return await callApi(
    'POST',
    `${process.env.APP_LICENSE_API_URL}/api/latest_version`,
    JSON.stringify(payload),
  )
}

export async function checkUpdate(productId: string, currentVersion: string) {
  const payload = {
    product_id: productId,
    current_version: currentVersion,
  }
  return await callApi(
    'POST',
    `${process.env.APP_LICENSE_API_URL}/api/check_update`,
    JSON.stringify(payload),
  )
}

export async function downloadUpdate(
  productId: string,
  updateId: string,
  version: string,
  product: string,
  type?: string,
): Promise<any> {
  try {
    if (!productId || !updateId || !version || !product) {
      throw new Error('Missing required arguments.')
    }
    const licenseFilePath = `${rootPath}/${productId}.lic`
    const licenseFile = await fs.readFile(licenseFilePath, 'utf8')

    const data = {
      license_file: licenseFile,
      license_code: null,
      client_name: null,
    }

    // Call API to download update
    const response = await callApi(
      'POST',
      `${process.env.APP_LICENSE_API_URL}/api/download_update/main/${updateId}`,
      JSON.stringify(data),
      `${product}-${version}`,
    )

    if (!response || response.status === 'fail') {
      logger.error(`Download failed: ${response?.message}`)
      throw new Error(`Download failed: ${response?.message}`)
    }

    if (!response.path) {
      logger.error(`Download failed: No update file path returned.`)
      throw new Error(`Download failed: No update file path returned.`)
    }

    // Check for Prisma folder and generate system report if it exists
    try {
      const hasPrismaFolder = checkForPrismaFolder(response.path)

      if (hasPrismaFolder) {
        await storeSystemReport(
          'db',
          `${product}-${version} has database changes. Please run (npx prisma migrate deploy --preview-feature) to apply the changes.`,
          false,
        )
      }
    } catch (error) {
      logger.error(`Prisma check failed: ${error.message}`)
      throw new Error(`Prisma check failed: ${error.message}`)
    }

    try {
      // Extract the main update
      unzip(response.path, rootPath)

      if (type === 'extension') {
        try {
          await updateExtensionQuery(productId, version)
        } catch (error) {
          logger.error(`Update of extension version failed: ${error.message}`)
          throw new Error(
            `Update of extension version failed: ${error.message}`,
          )
        }
      } else {
        // Update platform.json with the new version
        const platformFilePath = `${rootPath}/platform.json`
        const platformContent = await fs.readFile(platformFilePath, 'utf8')
        const platformData = JSON.parse(platformContent)

        const productIndex = platformData.findIndex(
          (item: any) => item.id === productId,
        )
        if (productIndex === -1) {
          throw new Error(
            `Product with productId ${productId} not found in platform.json`,
          )
        }

        platformData[productIndex].version = version
        await fs.writeFile(
          platformFilePath,
          JSON.stringify(platformData, null, 2),
        )
      }

      // Remove the zip file after successful extraction
      await fs.unlink(response.path)
      return {
        message: 'Update downloaded and extracted successfully',
      }
    } catch (error) {
      logger.error(`Extraction of update files failed: ${error.message}`)
      throw new Error(`Extraction of update files failed: ${error.message}`)
    }
  } catch (error) {
    logger.error(`Download Update Error: ${error.message}`)
    throw new Error(`Download Update Error: ${error.message}`)
  }
}

const unzip = (filePath: string, outPath: string) => {
  const zip = new AdmZip(filePath)
  zip.extractAllTo(outPath, true)
}

const checkForPrismaFolder = (zipPath: string) => {
  const zip = new AdmZip(zipPath)
  const zipEntries = zip.getEntries()

  for (const zipEntry of zipEntries) {
    if (zipEntry.isDirectory) {
      if (zipEntry.entryName.startsWith('prisma/')) {
        return true
      }
    }
  }

  return false
}
