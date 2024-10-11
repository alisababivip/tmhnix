import fs from 'fs'
import { cacheSettings } from '~~/http/settings/controller'
import { getSettings } from '~~/http/settings/queries'
import { handleController } from '~~/utils'
import { redis } from '~~/utils/redis'
import { updateSettings } from './queries'
const { Translate } = require('@google-cloud/translate').v2

const rootPath = `${process.cwd()}/.app`
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

export const controllers = {
  update: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateSettings(body.data)
      await cacheSettings()
      try {
        const cachedSettings = await redis.get('settings')
        if (cachedSettings) {
          const settings = JSON.parse(cachedSettings)
          return {
            ...settings,
            message: 'Settings updated successfully',
          }
        }
      } catch (err) {
        console.error('Redis error:', err)
      }
      const settings = await getSettings()
      return {
        ...settings,
        message: 'Settings updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  editLocale: handleController(async (_, __, ___, ____, body) => {
    try {
      await editLocale(body.code, body.updates)
      return {
        message: 'Locale updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  localeStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await toggleLocaleStatus(body.code, body.status)
      return {
        message: 'Locale updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  localeTranslate: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await batchTranslate(body.keys, body.targetLang)
      return {
        ...response,
        message: 'Locale translated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}

export async function editLocale(
  code: string,
  updates: Record<string, any>,
): Promise<void> {
  const LocaleJsonFilePath = `${rootPath}/data/locales/${code}.json`

  // Check if the file exists
  if (!fs.existsSync(LocaleJsonFilePath)) {
    throw new Error(`Locale file for code ${code} does not exist.`)
  }

  const data = fs.readFileSync(LocaleJsonFilePath, 'utf8')
  let languages: Record<string, any>

  try {
    languages = JSON.parse(data)
  } catch (e) {
    throw new Error('Failed to parse locale JSON file.')
  }

  // Apply the updates directly to the languages object
  Object.assign(languages, updates)
  fs.writeFileSync(LocaleJsonFilePath, JSON.stringify(languages, null, 2))
}

export async function toggleLocaleStatus(
  code: string,
  status: number,
): Promise<void> {
  const jsonFilePath = `${rootPath}/data/languages.json`
  const data = fs.readFileSync(jsonFilePath, 'utf8')
  const languages = JSON.parse(data)
  const index = languages.findIndex((lang: any) => lang.code === code)
  if (index !== -1) {
    languages[index].status = status
    fs.writeFileSync(jsonFilePath, JSON.stringify(languages, null, 2))
  }
}
export async function batchTranslate(
  keysToTranslate: string[],
  targetLang: string,
): Promise<any> {
  const translateInstance = new Translate({
    key: GOOGLE_TRANSLATE_API_KEY,
  })
  const translations: Record<string, string> = {}
  const sanitizedTargetLang = sanitizeLanguageCode(targetLang)

  try {
    // Perform batch translation
    const translatedTexts = await Promise.all(
      keysToTranslate.map(async (key) => {
        const [translated] = await translateInstance.translate(
          key,
          sanitizedTargetLang,
        )
        return translated
      }),
    )

    // Map translations back to their original keys
    keysToTranslate.forEach((key, index) => {
      translations[key] = translatedTexts[index]
    })

    return translations
  } catch (error) {
    throw new Error(error.message)
  }
}

// Function to sanitize language codes
function sanitizeLanguageCode(code: string): string {
  const mapping = {
    cn: 'zh',
    mx: 'es',
  }
  return mapping[code] || code
}
