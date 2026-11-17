import { prisma } from '@repo/database'

/**
 * Returns the shared PrismaClient instance (includes MenuItem & ServiceOrder models).
 */
export const getPrismaClient = () => prisma

export type { PrismaClient } from '@repo/database'


