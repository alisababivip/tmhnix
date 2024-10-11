import fs from 'fs'
import { defineEventHandler } from 'h3'
import mime from 'mime'
import path from 'path'
import { URL } from 'url'

const rootPath = process.cwd()

// Base directories for different types of images
const BASE_UPLOAD_DIR = path.join(rootPath, 'public', 'uploads')
const BASE_THEME_DIR = path.join(rootPath, '.app', 'public', 'theme')
const BASE_CRYPTO_IMAGE = path.join(rootPath, '.app', 'public', 'img', 'crypto')
const BASE_PLACEHOLDER_IMAGE = path.join(
  rootPath,
  '.app',
  'public',
  'img',
  'placeholder.png',
)

// Function to send a file
const sendFile = (res, filePath) => {
  try {
    const mimeType = mime.getType(filePath) || 'application/octet-stream'
    const data = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mimeType })
    res.write(data)
    res.end()
  } catch (error) {
    res.writeHead(404)
    res.end('Not found')
  }
}

export default defineEventHandler(async (event) => {
  const { req, res } = event.node
  const { url } = req
  if (!url) return

  const pathname = new URL(url, `http://${req.headers.host}`).pathname

  // Handle requests to /uploads
  if (pathname.startsWith('/uploads')) {
    const filePath = path.join(
      BASE_UPLOAD_DIR,
      decodeURIComponent(pathname.replace('/uploads/', '')),
    )
    if (fs.existsSync(filePath)) {
      sendFile(res, filePath)
    } else {
      res.writeHead(404)
      res.end('File not found')
    }
  }

  // Handle requests to /theme
  if (pathname.startsWith('/theme')) {
    const filePath = path.join(
      BASE_THEME_DIR,
      decodeURIComponent(pathname.replace('/theme/', '')),
    )
    if (fs.existsSync(filePath)) {
      sendFile(res, filePath)
    } else {
      res.writeHead(404)
      res.end('File not found')
    }
  }

  // Handle requests to /img/crypto
  if (pathname.startsWith('/img/crypto')) {
    const filePath = path.join(
      BASE_CRYPTO_IMAGE,
      decodeURIComponent(pathname.replace('/img/crypto', '')),
    )
    if (fs.existsSync(filePath)) {
      sendFile(res, filePath)
    } else {
      sendFile(res, BASE_PLACEHOLDER_IMAGE)
    }
  }
})
