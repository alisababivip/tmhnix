// prismaClient.mjs
import { PrismaClient } from '@prisma/client'

// Since `global` is not available in ES modules, we use a workaround
const GlobalPrisma = globalThis.PrismaGlobal || {}

let prisma

// Ensure a single instance of Prisma
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!GlobalPrisma.prisma) {
    GlobalPrisma.prisma = new PrismaClient()
  }
  prisma = GlobalPrisma.prisma
}

// Assigning our PrismaGlobal to the globalThis object
globalThis.PrismaGlobal = GlobalPrisma

export default prisma
