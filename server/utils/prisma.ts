import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

// Ensure a single instance of Prisma
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In non-production environments, use a global variable to store and reuse the instance
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
