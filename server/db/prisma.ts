// Load environment variables FIRST
import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'

// Create a single Prisma Client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable query logging (helpful for learning!)
})

// Handle cleanup on shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma
