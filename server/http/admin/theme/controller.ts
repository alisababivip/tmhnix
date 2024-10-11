/* eslint-disable prettier-vue/prettier */
import AdmZip from 'adm-zip'
import archiver from 'archiver'
import { exec } from 'child_process'
import fsf from 'fs'
import fs from 'fs/promises'
import glob from 'glob'
import fetch from 'node-fetch'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { transliterate } from 'transliteration'
import util, { promisify } from 'util'
import builder from 'xmlbuilder'
import { handleController } from '~~/utils'

const baseUrl = path.join(process.cwd(), '.app', 'public', 'theme')
const publicUrl = path.join(process.cwd(), '.app', 'public')

const execAsync = promisify(exec)
const mkdirAsync = util.promisify(fsf.mkdir)
const existsAsync = util.promisify(fsf.exists)
const unlinkAsync = util.promisify(fsf.unlink)

function returnBytes(val) {
  if (!val) return 0
  const lastChar = val.slice(-1).toLowerCase()
  let size = parseInt(val, 10)

  switch (lastChar) {
    case 'g':
      size *= 1024 * 1024 * 1024
      break
    case 'm':
      size *= 1024 * 1024
      break
    case 'k':
      size *= 1024
      break
  }

  return size
}

async function exists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function ensureDirExists(dir) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function getPHPConfigValue(configName) {
  try {
    const phpCommand = `php -r "echo ini_get('${configName}');"`
    const { stdout } = await execAsync(phpCommand)
    return stdout.trim()
  } catch (error) {
    console.error(`Error getting PHP config for ${configName}:`, error)
    return null
  }
}

async function loadProjectList() {
  const projectsDir = path.join(publicUrl, 'projects')
  try {
    const projects = await fs.readdir(projectsDir)
    const projectList = await Promise.all(
      projects.map(async (project) => {
        const projectFile = path.join(projectsDir, project, 'project.json')
        if (await exists(projectFile)) {
          return project
        }
        return null
      }),
    )
    return projectList.filter(Boolean)
  } catch (error) {
    console.error('Error loading project list:', error)
    return []
  }
}

async function saveProject(project) {
  const jsonProject = Buffer.from(project, 'base64').toString('utf-8')
  const projectObj = JSON.parse(jsonProject)

  if (projectObj && projectObj !== 'null') {
    const dir = path.join(publicUrl, projectObj['dir'])
    await ensureDirExists(dir)
    const fileWhitelist = ['project.json', 'sitemap.xml', 'robots.txt']
    const newFiles = new Set(fileWhitelist)

    // Update existing files only if they have non-null content
    if (projectObj['pages']) {
      for (const page of projectObj['pages']) {
        if (page['html'] !== null && page['html'] !== undefined) {
          const htmlPath = path.join(dir, page['path'])
          await fs.writeFile(htmlPath, page['html'])
          delete page['html'] // Remove HTML content from JSON
        }
        newFiles.add(page['path'])
      }
    }

    // Handle sections
    if (projectObj['sections']) {
      for (const section of projectObj['sections']) {
        if (section['html'] !== null && section['html'] !== undefined) {
          const title = sanitizeTitle(section['title'])
          let newFileName = `${title}.html`
          let j = 0
          while (newFiles.has(newFileName)) {
            j++
            newFileName = `${title}-${j}.html`
          }
          newFiles.add(newFileName)
          section['path'] = newFileName

          const htmlPath = path.join(dir, 'elements', newFileName)
          await fs.writeFile(htmlPath, section['html'])
          delete section['html'] // Remove HTML content from JSON
        }
      }
    }

    // Save additional files only if they have content
    if (projectObj['files']) {
      for (const [key, value] of Object.entries(projectObj['files'])) {
        if (value['content'] !== null && value['content'] !== undefined) {
          const filePath = path.join(dir, key)
          await fs.writeFile(filePath, value['content'])
          newFiles.add(key)
        }
      }
    }

    // Remove files marked for deletion
    if (projectObj['filesToDelete']) {
      for (const fileToDelete of projectObj['filesToDelete']) {
        const targetFile = path.join(dir, fileToDelete)
        if (await exists(targetFile)) {
          await fs.unlink(targetFile)
        }
      }
      delete projectObj['filesToDelete']
    }

    // Save the project file
    const projectFile = path.join(dir, 'project.json')
    const projectStr = JSON.stringify(projectObj)
    await fs.writeFile(projectFile, projectStr)

    return projectStr
  }
}

function sanitizeTitle(title) {
  const transliteratedTitle = transliterate(title)
  // Replace spaces and special characters with hyphens
  return transliteratedTitle
    .toLowerCase()
    .replace(/[\s\?\|\:\\\/\*\>\<\.\"\,]/g, '-')
}

async function saveProjectByParts(part, index, lastChunk) {
  const tempDir = path.join(baseUrl, 'temp')
  const tempFile = path.join(tempDir, `save-${index}.txt`)

  try {
    await fs.mkdir(tempDir, { recursive: true })

    if (!lastChunk) {
      await fs.writeFile(tempFile, part)
      return 'Part saved successfully'
    } else {
      let projectData = ''

      for (let i = 0; i < index; i++) {
        const chunkFile = path.join(tempDir, `save-${i}.txt`)
        if (await exists(chunkFile)) {
          const chunk = await fs.readFile(chunkFile, 'utf8')
          projectData += chunk
          await fs.unlink(chunkFile)
        }
      }

      projectData += part // Add the last part outside the loop
      await saveProject(projectData) // Ensure this function is defined elsewhere in your code
      await fs.rm(tempDir, { recursive: true, force: true })

      return 'Project saved successfully'
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

async function getIncludedFilesContents(files, dir) {
  if (!files) return 'No files specified'

  try {
    const filesObj = JSON.parse(files)
    const includedFilesContents = {}
    for (const key in filesObj) {
      const filePath = path.join(publicUrl, dir, key)
      if (await exists(filePath)) {
        includedFilesContents[key] = await fs.readFile(filePath, 'utf8')
      } else {
        includedFilesContents[key] = 'empty'
      }
    }
    return includedFilesContents
  } catch (error) {
    console.error('Error getting included files contents:', error)
    return 'Error getting included files contents'
  }
}

async function deleteDir(dirPath) {
  const files = await fs.readdir(dirPath, { withFileTypes: true })
  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirPath, file.name)
      if (file.isDirectory()) {
        await deleteDir(filePath)
      } else {
        await fs.unlink(filePath)
      }
    }),
  )
  await fs.rmdir(dirPath)
}

async function createThumbnail(source, destination) {
  try {
    await sharp(source).resize(220, 230).toFile(destination)
  } catch (error) {
    console.error('Error creating thumbnail:', error)
    throw error
  }
}

async function zipDirectory(source, out): Promise<void> {
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = fsf.createWriteStream(out)

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', (err) => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

const base64ToJpeg = async (base64String, outputFilePath) => {
  // Check for and remove the data URL prefix
  const matches = base64String.match(/^data:image\/jpeg;base64,(.+)/)
  const base64Data = matches ? matches[1] : base64String
  const buffer = Buffer.from(base64Data, 'base64')
  await fs.writeFile(outputFilePath, buffer)
}

const resizeImage = async (filePath) => {
  try {
    // Check if the file exists
    if (!exists(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Create a temporary file path
    const tempFilePath = filePath.replace(/\.jpg$/, '-temp.jpg')

    // Resize and save the image to the temporary file
    await sharp(filePath).resize(220, 230).toFile(tempFilePath)

    // Replace the original file with the temporary file
    await fs.rename(tempFilePath, filePath)

    // Return the file path of the resized image
    return filePath
  } catch (error) {
    console.error(`Error resizing image: ${filePath}`, error)
    throw error
  }
}

function toXml(object, data, settings) {
  data.forEach((item) => {
    const urlElement = object.ele('url')
    for (const key in item) {
      if (key === 'index') {
        const pageData = item[key] ? settings.homePage : settings.otherPages
        if (pageData.frequency) {
          urlElement.ele('changefreq', pageData.frequency)
        }
        if (pageData.priority) {
          urlElement.ele('priority', pageData.priority)
        }
      } else {
        urlElement.ele(key, item[key])
      }
    }
  })
}

async function recurseCopy(src, dst) {
  await fs.mkdir(dst, { recursive: true })

  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const dstPath = path.join(dst, entry.name)

    if (entry.isDirectory()) {
      await recurseCopy(srcPath, dstPath)
    } else {
      await fs.copyFile(srcPath, dstPath)
    }
  }
}

async function rmdirRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      return entry.isDirectory()
        ? rmdirRecursive(fullPath)
        : fs.unlink(fullPath)
    }),
  )
  await fs.rmdir(dir)
}

function getPageTitle(content) {
  const match = content.match(/<title>(.*?)<\/title>/is)
  if (match) {
    let title = match[1].replace(/\s+/g, ' ').trim()
    title = title.replace(',', '')
    return title
  }
  return null
}

export const controllers = {
  info: handleController(async () => {
    const uploadMaxFilesize = returnBytes(
      await getPHPConfigValue('upload_max_filesize'),
    )
    const memoryLimit = returnBytes(await getPHPConfigValue('memory_limit'))
    const maxFileUploads = await getPHPConfigValue('max_file_uploads')
    const postMaxSize = returnBytes(await getPHPConfigValue('post_max_size'))

    const response = {
      settings: {
        upload_max_filesize: uploadMaxFilesize,
        memory_limit: memoryLimit,
        max_file_uploads: parseInt(maxFileUploads, 10) || 0,
        post_max_size: postMaxSize,
        system_memory: os.totalmem(),
      },
    }

    return response
  }),

  getLanguage: handleController(async (_, __, ___, ____, body) => {
    try {
      const langPath = path.join(baseUrl, 'lang')
      const allDataPath = path.join(langPath, 'languages.json')

      if (!(await exists(allDataPath))) {
        return { error: 'Languages file not found' }
      }

      const allLang = JSON.parse(await fs.readFile(allDataPath, 'utf8'))

      if (allLang['en']) {
        const enLang = allLang['en']
        const enFile = path.join(langPath, enLang['file'])
        if (await exists(enFile)) {
          allLang['en']['data'] = JSON.parse(await fs.readFile(enFile, 'utf8'))
        }
      }

      const requestedLang = body.lang
      if (requestedLang && allLang[requestedLang]) {
        const langFile = path.join(langPath, allLang[requestedLang]['file'])
        if (await exists(langFile)) {
          allLang[requestedLang]['data'] = JSON.parse(
            await fs.readFile(langFile, 'utf8'),
          )
        } else {
          allLang[requestedLang]['error'] = true
        }
      }

      for (const key in allLang) {
        if (key !== 'error') {
          const langFile = path.join(langPath, allLang[key]['file'])
          if (!(await exists(langFile))) {
            delete allLang[key]
          }
        }
      }

      return allLang
    } catch (e) {
      return {
        error: 'An error occurred while processing languages',
        details: e.message,
      }
    }
  }),

  getSections: handleController(async (_, __, ___, ____, body) => {
    const { sections, dir } = body
    if (!sections || !dir) {
      return []
    }

    const sectionsData = JSON.parse(sections)
    const projectDir = path.join(publicUrl, dir, 'elements')
    const updatedSections = await Promise.all(
      sectionsData.map(async (section) => {
        if (section.path) {
          const htmlPath = path.join(projectDir, section.path)
          if (await exists(htmlPath)) {
            section.html = await fs.readFile(htmlPath, 'utf8')
          }
        }
        return section
      }),
    )

    return updatedSections
  }),

  loadModules: handleController(async () => {
    const modulesDir = path.join(baseUrl, 'modules')

    try {
      await ensureDirExists(modulesDir)
      const moduleFiles = await fs.readdir(modulesDir)
      const modules = moduleFiles.map((file) => path.join('modules', file))
      return modules
    } catch (error) {
      console.error('Error loading modules:', error)
      return []
    }
  }),

  projectActions: handleController(async (_, __, ___, ____, body) => {
    const { action, project, part, index, lastChunk, files, dir } = body

    switch (action) {
      case 'loadProjectList':
        return await loadProjectList()
      case 'SaveProject':
        return await saveProject(project)
      case 'SaveProjectByParts':
        return await saveProjectByParts(part, index, lastChunk)
      case 'getIncludedFilesContents':
        return await getIncludedFilesContents(files, dir)
      default:
        return 'Invalid action'
    }
  }),

  checkIconFonts: handleController(async (_, __, ___, ____, body) => {
    const { fonts, project, dir } = body
    if (fonts && project && dir) {
      const src = fonts.split(',')
      const projectName = project
      const fontsDir = dir
      const checkfile = 'mash-icon-font.txt'

      const checkDir = path.join(baseUrl, projectName, fontsDir)

      for (let i = 0; i < src.length; i++) {
        const fontPath = path.join(checkDir, src[i])
        if (await exists(fontPath)) {
          const checkFilePath = path.join(fontPath, checkfile)
          if (await exists(checkFilePath)) {
            await deleteDir(fontPath)
          }
        }
      }
    }
  }),

  mediaCheckItems: handleController(async (_, __, ___, ____, body) => {
    const { dir, items } = body
    if (!dir || !items) {
      throw new Error('Invalid request')
    }

    const projectDir = path.join(publicUrl, dir)
    const mediaDir = path.join(projectDir, 'mash', 'media')
    const thumbsDir = path.join(mediaDir, 'thumbnails')
    const itemsObj = JSON.parse(items)

    const itemsToRemove = []
    const videosWithoutPreview = []
    const itemsDimensions = []

    const existingFiles = await fs.readdir(mediaDir)
    const existingThumbnails = await fs.readdir(thumbsDir)

    for (const item of itemsObj) {
      const itemPath = path.join(mediaDir, item.original)
      const thumbPath = path.join(thumbsDir, path.basename(item.thumbnail))

      if (item.type !== 'image') {
        videosWithoutPreview.push(item.id)
        continue
      }

      if (!(await exists(itemPath))) {
        itemsToRemove.push(item.id)
        continue
      }

      const size = await sharp(itemPath).metadata()
      itemsDimensions.push({
        width: size.width,
        height: size.height,
        id: item.id,
      })

      if (!(await exists(thumbPath))) {
        await createThumbnail(itemPath, thumbPath)
      }

      const fileIndex = existingFiles.indexOf(item.original)
      if (fileIndex > -1) {
        existingFiles.splice(fileIndex, 1)
      }

      const thumbIndex = existingThumbnails.indexOf(
        path.basename(item.thumbnail),
      )
      if (thumbIndex > -1) {
        existingThumbnails.splice(thumbIndex, 1)
      }
    }

    // Remove unused files
    for (const file of existingFiles) {
      const filePath = path.join(mediaDir, file)
      const fileStats = await fs.stat(filePath)

      if (fileStats.isFile()) {
        await fs.unlink(filePath)
      }
    }

    // Remove unused thumbnails
    for (const thumb of existingThumbnails) {
      const thumbPath = path.join(thumbsDir, thumb)
      const thumbStats = await fs.stat(thumbPath)

      if (thumbStats.isFile()) {
        await fs.unlink(thumbPath)
      }
    }

    return {
      itemsToRemove,
      videosWithoutPreview,
      itemsDimensions,
    }
  }),

  getPages: handleController(async (_, __, ___, ____, body) => {
    const { pages, dir } = body
    if (!pages || !dir) {
      return []
    }

    const pagesData = JSON.parse(pages)
    const projectDir = path.join(publicUrl, dir)

    const updatedPages = await Promise.all(
      pagesData.map(async (page) => {
        if (page.path) {
          const htmlPath = path.join(projectDir, page.path)
          if (await exists(htmlPath)) {
            page.html = await fs.readFile(htmlPath, 'utf8')
          }
        }
        return page
      }),
    )

    return updatedPages
  }),

  cropImage: handleController(async (_, __, ___, ____, body) => {
    try {
      const { data, destination, dir } = body
      if (!data || !destination || !dir) {
        throw new Error('Missing required parameters')
      }

      const { src, width, height, x, y } = JSON.parse(data)
      const sourcePath = path.join(publicUrl, src)
      const targetDir = path.join(publicUrl, dir, destination)

      // Ensure target directory exists
      await ensureDirExists(targetDir)

      const ext = path.extname(src)
      const baseName = path.basename(src, ext)
      const formattedName = baseName.replace(/\s+/g, '-').toLowerCase()
      const filename = `${formattedName}-${width}x${height}${ext}`
      const targetPath = path.join(targetDir, filename)

      // Crop and save the image
      await sharp(sourcePath)
        .extract({ left: x, top: y, width, height })
        .toFile(targetPath)

      return path.join(destination, filename).replace(/\\/g, '/')
    } catch (error) {
      console.error('Error in cropImage:', error)
      throw error
    }
  }),

  mediaUpload: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, files } = body
      if (!dir || !files || files.length === 0) {
        throw new Error('No directory specified or no files provided')
      }

      const projectDir = path.join(publicUrl, dir)
      const mediaDir = path.join(projectDir, 'mash', 'media')
      const thumbsDir = path.join(mediaDir, 'thumbnails')

      await ensureDirExists(mediaDir)
      await ensureDirExists(thumbsDir)

      const items = []
      for (const file of files) {
        const mimeType = file.type
        if (
          ![
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/avi',
            'video/ogg',
          ].includes(mimeType)
        ) {
          throw new Error('Unsupported file format')
        }

        const originalFilename = file.name || 'unnamed-file'
        const ext = path.extname(originalFilename)
        const baseName = transliterate(originalFilename.slice(0, -ext.length))
          .toLowerCase()
          .replace(/\s+/g, '-')
        let targetName = `${baseName}${ext}`
        let counter = 0

        // Ensure unique file name
        while (await exists(path.join(mediaDir, targetName))) {
          counter++
          targetName = `${baseName}-${counter}${ext}`
        }

        const filePath = path.join(mediaDir, targetName)
        await fs.writeFile(filePath, Buffer.from(file.data))

        let size, thumbnailPath
        // Process thumbnail if image, skip if video
        if (['.jpeg', '.jpg', '.png', '.gif'].includes(ext)) {
          size = await sharp(filePath).metadata()
          thumbnailPath = path.join('mash', 'media', 'thumbnails', targetName)
          const thumbFullPath = path.join(thumbsDir, targetName)
          await createThumbnail(filePath, thumbFullPath)
        } else {
          // For videos, set size to null and thumbnail to 'isLoading'
          size = { width: null, height: null }
          thumbnailPath = 'isLoading'
        }

        items.push({
          original: targetName,
          type: ['.mp4', '.webm', '.avi', '.ogg'].includes(ext)
            ? 'video'
            : 'image',
          thumbnail: thumbnailPath,
          width: size.width,
          height: size.height,
          id: items.length,
        })
      }

      return items.map((item) => ({
        ...item,
        thumbnail:
          item.thumbnail !== 'isLoading'
            ? path.join(dir, item.thumbnail).replace(/\\/g, '/')
            : item.thumbnail,
      }))
    } catch (error) {
      console.error('Error in addMediaItems:', error)
      throw error
    }
  }),

  mediaAddToProject: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, fileName, destination } = body
      if (!dir || !fileName || !destination) {
        throw new Error('Missing required parameters')
      }

      const projectDir = path.join(publicUrl, dir)
      const filePath = path.join(projectDir, 'mash', 'media', fileName)
      const destDir = path.join(projectDir, destination)

      if (!(await exists(filePath))) {
        throw new Error("File doesn't exist")
      }

      await ensureDirExists(destDir)

      const ext = path.extname(fileName)
      const baseName = path.basename(fileName, ext)
      let counter = 0
      let checkName = fileName
      let destFile = path.join(destDir, checkName)

      while (await exists(destFile)) {
        counter++
        checkName = `${baseName}-${counter}${ext}`
        destFile = path.join(destDir, checkName)
      }

      await fs.copyFile(filePath, destFile)

      return path.join(destination, checkName).replace(/\\/g, '/')
    } catch (error) {
      console.error('Error in mediaAddToProject:', error)
      throw error
    }
  }),

  cropMedia: handleController(async (_, __, ___, ____, body) => {
    try {
      const { data, dir, resize } = body
      if (!data || !dir) {
        return 2
      }

      const {
        copyOriginalImage,
        width,
        height,
        imgWidth,
        imgHeight,
        src,
        x,
        y,
      } = JSON.parse(data)
      const pathToImg = path.join(publicUrl, src)
      const mediaDir = path.join(publicUrl, dir, 'mash', 'media')
      const thumbsDir = path.join(mediaDir, 'thumbnails')

      if (!(await exists(pathToImg))) {
        throw new Error('Image file does not exist')
      }

      const ext = path.extname(src)
      const baseName = path.basename(src, ext)
      let targetName = `${baseName}-${width}x${height}${ext}`
      let counter = 0

      while (await exists(path.join(mediaDir, targetName))) {
        counter++
        targetName = `${baseName}-${counter}${ext}`
      }
      const newPathToImg = path.join(mediaDir, targetName)

      if (copyOriginalImage) {
        await fs.copyFile(pathToImg, newPathToImg)
      }

      let cropOptions
      if (resize === 'true') {
        cropOptions = { left: 0, top: 0, width: imgWidth, height: imgHeight }
      } else {
        cropOptions = { left: x, top: y, width, height }
      }

      await sharp(pathToImg).extract(cropOptions).toFile(newPathToImg)

      if (copyOriginalImage || (!copyOriginalImage && resize !== 'true')) {
        const thumbPath = path.join(thumbsDir, targetName)
        await createThumbnail(newPathToImg, thumbPath)
      }

      return {
        copyOriginal: copyOriginalImage,
        pathToImg: path
          .join(dir, 'mash', 'media', targetName)
          .replace(/\\/g, '/'),
        pathToThumb: path
          .join(dir, 'mash', 'media', 'thumbnails', targetName)
          .replace(/\\/g, '/'),
        width,
        height,
      }
    } catch (error) {
      console.error('Error in cropMedia:', error)
      throw error
    }
  }),

  mediaAddItemsByUrls: handleController(async (_, __, ___, ____, body) => {
    try {
      const { urls, dir } = body
      if (!urls || !dir) {
        throw new Error('URLs and directory are required')
      }

      const projectDir = path.join(publicUrl, dir)
      const mediaDir = path.join(projectDir, 'mash', 'media')
      const thumbsDir = path.join(mediaDir, 'thumbnails')

      await ensureDirExists(mediaDir)
      await ensureDirExists(thumbsDir)

      const extensions = ['jpeg', 'jpg', 'png', 'gif']
      const items = []

      for (const url of JSON.parse(urls)) {
        const response = await fetch(url)
        if (!response.ok) continue

        const buffer = await response.buffer()
        const name = 'unsplash-photo.jpg' // Adjust this according to your requirements
        const ext = path.extname(name).slice(1).toLowerCase()
        const baseName = path.basename(name, `.${ext}`)

        if (!extensions.includes(ext)) continue

        let counter = 0
        let checkName = `${baseName}-${counter}.${ext}`
        while (await exists(path.join(mediaDir, checkName))) {
          counter++
          checkName = `${baseName}-${counter}.${ext}`
        }

        const filePath = path.join(mediaDir, checkName)
        await fs.writeFile(filePath, buffer)

        const size = await sharp(filePath).metadata()
        const thumbnailPath = path.join(thumbsDir, checkName)

        await createThumbnail(filePath, thumbnailPath)

        items.push({
          original: checkName,
          type: 'image',
          width: size.width,
          height: size.height,
          thumbnail: path
            .join(dir, 'mash', 'media', 'thumbnails', checkName)
            .replace(/\\/g, '/'),
        })
      }

      return items
    } catch (error) {
      console.error('Error in mediaAddItemsByUrls:', error)
      throw error
    }
  }),

  addVideoPreview: handleController(async (_, __, ___, ____, body) => {
    try {
      const { previews, dir } = body
      console.log('Previews:', previews) // Log the previews

      if (!previews || !dir) {
        throw new Error('Previews and directory are required')
      }

      const previewsObj = Array.isArray(previews)
        ? previews
        : JSON.parse(previews)
      const projectDir = path.join(publicUrl, dir)
      const thumbsDir = path.join(projectDir, 'mash', 'media', 'thumbnails')

      await ensureDirExists(thumbsDir)

      const results = await Promise.all(
        previewsObj.map(async (preview) => {
          if (!preview.imageString) {
            throw new Error('ImageString is undefined')
          }

          const thumbPath = path.join(
            thumbsDir,
            `${preview.name}-mash-video.jpg`,
          )
          await base64ToJpeg(preview.imageString, thumbPath)
          await resizeImage(thumbPath)

          return {
            ...preview.item,
            thumbnail: path
              .join(
                dir,
                'mash',
                'media',
                'thumbnails',
                `${preview.name}-mash-video.jpg`,
              )
              .replace(/\\/g, '/'),
          }
        }),
      )

      return results
    } catch (error) {
      throw error.message
    }
  }),

  exportProject: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, name } = body
      if (!dir || !name) {
        throw new Error('Directory and name are required')
      }

      const projectDir = path.join(publicUrl, dir)
      const sanitizedProjectName = name
        .toLowerCase()
        .replace(/[\s\?\|\:\\\/\*\>\<\.\"\,]/g, '-')
      const destination = path.join(
        baseUrl,
        'temp',
        `${sanitizedProjectName}.zip`,
      )

      if (!(await existsAsync(path.join(baseUrl, 'temp')))) {
        await mkdirAsync(path.join(baseUrl, 'temp'), {})
      }

      if (await existsAsync(destination)) {
        await unlinkAsync(destination)
      }

      await zipDirectory(projectDir, destination)

      return `/theme/temp/${sanitizedProjectName}.zip`
    } catch (error) {
      console.error('Error in exportProject:', error)
      throw error
    }
  }),

  extractZip: handleController(async (_, __, ___, ____, body) => {
    try {
      const { destination, zip } = body
      if (!destination || !zip) {
        throw new Error('Destination and zip file path are required')
      }

      const zipPath = path.join(publicUrl, zip)
      const destPath = path.join(publicUrl, destination)

      // Check if the destination path exists and is writable
      if (await exists(destPath)) {
        try {
          await fs.access(destPath, fs.constants.W_OK)
        } catch {
          return -1 // Not writable
        }
      } else {
        // Create destination directory if it doesn't exist
        await fs.mkdir(destPath, { recursive: true })
      }

      // Extract ZIP
      const zipFile = new AdmZip(zipPath)
      zipFile.extractAllTo(destPath, true)

      // Remove ZIP file
      await fs.unlink(zipPath)

      return 0
    } catch (error) {
      console.error('Error in extractZip:', error)
      return error.code === 'ENOENT' ? -2 : -3 // -2 for file not found, -3 for other errors
    }
  }),

  generateRobotsTxt: handleController(async (_, __, ___, ____, body) => {
    try {
      const { settings, path: inputPath } = body

      if (!settings || !inputPath) {
        throw new Error('Settings and path are required')
      }

      let content = ''
      if (settings.recommended) {
        content += `User-Agent: *\n`
        content += settings.indexingDisabled ? 'Disallow: /\n' : 'Allow: /\n'
      }

      if (settings.sitemapUrl) {
        content += `Sitemap: ${settings.sitemapUrl}\n`
      }

      if (settings.customCode) {
        content += settings.customCode
      }

      const destination = path.join(publicUrl, inputPath, 'robots.txt')
      await fs.writeFile(destination, content)
      return inputPath + 'robots.txt'
    } catch (error) {
      throw new Error(error.message)
    }
  }),

  generateSitemap: handleController(async (_, __, ___, ____, body) => {
    try {
      const { settings, pages, path: inputPath } = body

      if (!settings || !pages || !inputPath) {
        throw new Error('Settings, pages, and path are required')
      }

      const originalDestination = path.join(inputPath, 'sitemap.xml')
      const destination = path.join(publicUrl, originalDestination)

      const xml = builder
        .create('urlset', { encoding: 'UTF-8' })
        .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        .att(
          'xsi:schemaLocation',
          'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
        )
        .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

      toXml(xml, pages, settings)

      const xmlString = xml.end({ pretty: true })

      await fs.writeFile(destination, xmlString)
      return originalDestination
    } catch (error) {
      throw new Error(error.message)
    }
  }),

  copyFontToProject: handleController(async (_, __, ___, ____, body) => {
    try {
      const { source, project, destination, file } = body

      if (!source || !project || !destination) {
        throw new Error('Source, project, and destination are required')
      }

      const fontName = path.basename(source)
      if (source === 'null') {
        return null
      }

      const projectUrl = path.join(publicUrl, project)
      const targetDir = path.join(projectUrl, destination, fontName)

      await recurseCopy(path.join(publicUrl, source), targetDir)

      return path.join(destination, fontName, file)
    } catch (error) {
      console.error('Error in copyFontToProject:', error)
      return { error: true, message: error.message }
    }
  }),

  copyPagePreview: handleController(async (_, __, ___, ____, body) => {
    try {
      const { url, dir } = body

      if (!url || !dir) {
        throw new Error('URL and directory are required')
      }

      if (url === 'null') {
        return null
      }

      const projectUrl = path.join(publicUrl, dir)
      const uploadDir = 'mash/pages/'
      const tempDir = path.join(publicUrl, 'temp')

      await fs.mkdir(tempDir, { recursive: true })

      const { name, ext } = path.parse(url)
      const targetName = `${name}${ext}`
      const tempFilePath = path.join(tempDir, targetName)
      const destinationFilePath = path.join(
        projectUrl,
        uploadDir,
        `${name}-copy${ext}`,
      )

      await fs.copyFile(path.join(projectUrl, url), tempFilePath)
      await fs.rename(tempFilePath, destinationFilePath)

      return path.join(uploadDir, `${name}-copy${ext}`)
    } catch (error) {
      console.error('Error in copyPagePreview:', error)
      return { error: true, message: error.message }
    }
  }),

  copySectionPreview: handleController(async (_, __, ___, ____, body) => {
    try {
      const { url, dir } = body

      if (!url || !dir || url === 'null') {
        return null
      }

      const uploadDir = 'elements/'
      const projectUrl = path.join(publicUrl, dir)
      const tempDir = path.join(publicUrl, 'temp')
      const parsedPath = path.parse(url)
      const baseName = parsedPath.name
      const ext = parsedPath.ext

      await fs.mkdir(tempDir, { recursive: true })

      const sourcePath = path.join(projectUrl, url)
      const tempPath = path.join(tempDir, baseName + ext)
      const targetPath = path.join(
        projectUrl,
        uploadDir,
        `${baseName}-copy${ext}`,
      )

      await fs.copyFile(sourcePath, tempPath)
      await fs.rename(tempPath, targetPath)

      return path.join(uploadDir, `${baseName}-copy${ext}`)
    } catch (error) {
      console.error('Error in copySectionPreview:', error)
      return { error: true, message: error.message }
    }
  }),

  deleteProjectFiles: handleController(async (_, __, ___, ____, body) => {
    try {
      const { files, path: inputPath } = body

      for (let i = 0; i < files.length; i++) {
        const filePath = path.join(publicUrl, inputPath, files[i])
        if (await exists(filePath)) {
          await fs.unlink(filePath)
        }
      }

      return { result: true }
    } catch (error) {
      console.error('Error in deleteProjectFiles:', error)
      return { result: false, message: error.message }
    }
  }),

  mailformGetAddress: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir } = body

      if (!dir) {
        return { emails: '' }
      }

      const sourceUrl = path.join(publicUrl, dir, 'bat/rd-mailform.php')

      if (await exists(sourceUrl)) {
        const content = await fs.readFile(sourceUrl, 'utf8')
        const matches = content.match(/recipients\s*=\s*["']([^"']*)["'];/i)

        return { emails: matches ? matches[1] : '' }
      }

      return { emails: '' }
    } catch (error) {
      console.error('Error in mailformGetAddress:', error)
      return { emails: '', message: error.message }
    }
  }),

  mailformSetAddress: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, destination } = body

      if (!dir || !destination) {
        return { emails: '' }
      }

      const sourceUrl = path.join(publicUrl, dir, 'bat/rd-mailform.php')

      if (await exists(sourceUrl)) {
        let content = await fs.readFile(sourceUrl, 'utf8')
        content = content.replace(
          /(recipients\s*=\s*["'])([^"']*)(["'];)/,
          `$1${destination}$3`,
        )
        await fs.writeFile(sourceUrl, content)
        return { emails: destination }
      }

      return { emails: '' }
    } catch (error) {
      console.error('Error in mailformSetAddress:', error)
      return { emails: '', message: error.message }
    }
  }),

  moveFile: handleController(async (_, __, ___, ____, body) => {
    try {
      const { sourceFile, destination } = body

      if (!sourceFile || !destination) {
        return -1
      }

      const sourceFileName = path.basename(sourceFile)
      const sourceFilePath = path.join(publicUrl, sourceFile)
      const destFilePath = path.join(publicUrl, destination, sourceFileName)

      if (await exists(sourceFilePath)) {
        await fs.rename(sourceFilePath, destFilePath)
        return sourceFileName
      } else {
        return -1
      }
    } catch (error) {
      console.error('Error in moveFile:', error)
      return -1
    }
  }),

  projectImport: handleController(async (_, __, ___, ____, body) => {
    try {
      const { template, dir } = body

      if (!template || !dir) {
        return -1
      }

      const filePath = template
      const fileName = path.basename(filePath)
      const ext = path.extname(fileName).toLowerCase()
      const continueWithExtraction = ext === '.zip'

      if (!continueWithExtraction) {
        return -2
      }

      const targetDir = path.join(publicUrl, dir)
      const targetZip = path.join(publicUrl, filePath)
      const tmpDir = path.join(publicUrl, 'temp', 'upload')

      if (await exists(tmpDir)) {
        await rmdirRecursive(tmpDir)
      }

      const tmpTargetDir = path.join(targetDir, 'temp')

      if (!(await exists(tmpTargetDir))) {
        await fs.mkdir(tmpTargetDir, { recursive: true })
      }

      const zip = new AdmZip(targetZip)

      if (!zip.getEntry('project.json')) {
        await rmdirRecursive(tmpTargetDir)
        await fs.unlink(targetZip)
        return -4
      } else {
        if (await exists(targetDir)) {
          await rmdirRecursive(targetDir)
        }

        await fs.mkdir(targetDir, { recursive: true })

        zip.extractAllTo(targetDir, true)
        await fs.unlink(targetZip)

        return 1
      }
    } catch (error) {
      console.error('Error in projectImport:', error)
      return -3 // General error code
    }
  }),

  saveProjectFile: handleController(async (_, __, ___, ____, body) => {
    try {
      const { path: filePath, content } = body

      if (!filePath || content === undefined) {
        return 'false'
      }

      const url = path.join(publicUrl, filePath)

      // Create the file if it does not exist
      await fs.writeFile(url, content, { flag: 'w' })

      return 'true'
    } catch (error) {
      console.error('Error in saveProjectFile:', error)
      return 'false'
    }
  }),

  templateImport: handleController(async (_, __, ___, ____, body) => {
    try {
      const { template, dir } = body

      if (!template || !dir) {
        return -2
      }

      const targetDir = path.join(publicUrl, dir)
      const targetZip = path.join(publicUrl, template)
      const tmpDir = path.join(publicUrl, 'temp', 'upload')

      const zip = new AdmZip(targetZip)

      if (await exists(tmpDir)) {
        await rmdirRecursive(tmpDir)
      }
      if (await exists(targetDir)) {
        await rmdirRecursive(targetDir)
      }

      await fs.mkdir(targetDir, { recursive: true })
      zip.extractAllTo(targetDir, true)

      const project = {
        sections: [],
        name: path.basename(template, '.zip'),
        dir: dir.replace('../', ''),
        pages: [],
      }
      const htmlFiles = glob.sync(`${targetDir}/*.html`)

      for (let i = 0; i < htmlFiles.length; i++) {
        const content = await fs.readFile(htmlFiles[i], 'utf8')
        const title =
          getPageTitle(content) || path.basename(htmlFiles[i], '.html')
        project.pages.push({
          title,
          index: path.basename(htmlFiles[i]) === 'index.html',
          isActive: path.basename(htmlFiles[i]) === 'index.html',
          path: path.basename(htmlFiles[i]),
          preview: null,
        })
      }

      await fs.writeFile(
        path.join(targetDir, 'project.json'),
        JSON.stringify(project),
      )
      await fs.unlink(targetZip)

      return project
    } catch (error) {
      console.error('Error in templateImport:', error)
      return -3
    }
  }),

  updateIconFonts: handleController(async (_, __, ___, ____, body) => {
    try {
      const { fonts } = body

      if (!fonts) {
        return 'failure'
      }

      const fontsFile = path.join(publicUrl, 'icons', 'icons.json')

      if (await exists(fontsFile)) {
        await fs.writeFile(fontsFile, fonts)
        return 'success'
      } else {
        return 'failure'
      }
    } catch (error) {
      console.error('Error in updateIconFonts:', error)
      return 'failure'
    }
  }),

  updateSystemSettings: handleController(async (_, __, ___, ____, body) => {
    try {
      const { config } = body

      if (!config) {
        return 'Invalid input'
      }

      const configFile = path.join(baseUrl, 'config', 'config.json')

      if (await exists(configFile)) {
        await fs.writeFile(configFile, config)
        return 'success'
      } else {
        return 'Config file not found'
      }
    } catch (error) {
      console.error('Error in updateSystemSettings:', error)
      return 'Error updating system settings'
    }
  }),

  uploadFavicon: handleController(async (req, _, __, ___, ____) => {
    try {
      const { dir } = req.body
      const file = req.file // Assuming multer middleware is used

      if (!dir || !file) {
        return { error: 'Invalid input' }
      }

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/x-icon']
      if (!validMimeTypes.includes(file.mimetype)) {
        return {
          error:
            'The wrong favicon format is selected. Only .jpg, .png, .ico formats are supported.',
        }
      }

      const uploadDir = path.join(publicUrl, dir, 'images')
      const tmpName = path.join(uploadDir, file.originalname)

      await fs.rename(file.path, tmpName)

      return { url: 'images/' + file.originalname }
    } catch (error) {
      console.error('Error in uploadFavicon:', error)
      return { error: 'Error uploading favicon' }
    }
  }),

  uploadPagePreview: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, path: filePath } = body

      if (!dir || !filePath) {
        return { error: 'Invalid input' }
      }

      const validExtensions = ['.jpeg', '.jpg', '.png']
      const ext = path.extname(filePath).toLowerCase()

      if (!validExtensions.includes(ext)) {
        throw new Error(
          'The wrong file format is selected. Only .jpg, .png formats are supported.',
        )
      }

      const projectDir = path.join(publicUrl, dir, 'mash', 'pages')
      await ensureDirExists(projectDir)

      const baseName = path.basename(filePath)
      const targetName = baseName.replace(/\s+/g, '-').toLowerCase()
      let targetPath = path.join(projectDir, targetName + ext)
      let i = 0

      while (await exists(targetPath)) {
        targetPath = path.join(projectDir, `${targetName}-${++i}${ext}`)
      }

      const sourcePath = path.join(publicUrl, dir, filePath)
      await fs.copyFile(sourcePath, targetPath)

      const resultUrl =
        i > 0
          ? `mash/pages/${targetName}-${i}${ext}`
          : `mash/pages/${targetName}${ext}`

      return { url: resultUrl }
    } catch (error) {
      console.error('Error in uploadPagePreview:', error)
      return { error: true, message: error.message }
    }
  }),

  uploadSectionPreview: handleController(async (_, __, ___, ____, body) => {
    try {
      const { dir, path: inputPath } = body

      if (!dir || !inputPath) {
        return { error: 'Invalid input' }
      }

      const baseName = path.basename(inputPath)
      const pathInfo = path.parse(baseName)
      const targetName =
        pathInfo.name.toLowerCase().replace(/\s+/g, '-') + pathInfo.ext
      const validExtensions = ['.jpeg', '.jpg', '.png']

      if (!validExtensions.includes(pathInfo.ext.toLowerCase())) {
        throw new Error(
          'The wrong file format is selected. Only .jpg, .png formats are supported.',
        )
      }

      const projectPath = path.join(publicUrl, dir)
      const uploadDir = path.join(projectPath, 'elements')
      await ensureDirExists(uploadDir)

      let targetPath = path.join(uploadDir, targetName)
      let i = 0

      // Check if file exists and increment the counter until a new file name is found
      while (await exists(targetPath)) {
        targetPath = path.join(
          uploadDir,
          `${pathInfo.name}-${++i}${pathInfo.ext}`,
        )
      }

      await fs.copyFile(path.join(projectPath, inputPath), targetPath)
      const resultUrl =
        i > 0
          ? `elements/${pathInfo.name}-${i}${pathInfo.ext}`
          : `elements/${targetName}`

      return { url: resultUrl }
    } catch (error) {
      console.error('Error in uploadSectionPreview:', error)
      return { error: true, message: error.message }
    }
  }),
}
