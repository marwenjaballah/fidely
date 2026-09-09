import { OpenAPIHono } from '@hono/zod-openapi'
import type { Env } from '../../../types/index.js'
import {
  getAdminMetricsRoute,
  getAdminStoresRoute,
  getAdminUsersRoute,
  updateAdminUserRoleRoute,
  getAdminTransactionsRoute,
} from './admin.route.js'
import { AdminService } from '../../../services/admin.service.js'
import { requireUser } from '../../../utils/auth.js'

const router = new OpenAPIHono<Env>()

// Helper to ensure SUPER_ADMIN role
function requireSuperAdmin(c: any) {
  const user = requireUser(c)
  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Super Admin access required')
  }
  return user
}

router.openapi(getAdminMetricsRoute, async (c) => {
  try {
    requireSuperAdmin(c)
    const prisma = c.get('prisma')
    const service = new AdminService(prisma)
    const metrics = await service.getPlatformMetrics()
    return c.json(metrics, 200)
  } catch (error: any) {
    const isForbidden = error.message?.includes('Forbidden')
    return c.json({ error: error.message }, isForbidden ? 403 : 401) as any
  }
})

router.openapi(getAdminStoresRoute, async (c) => {
  try {
    requireSuperAdmin(c)
    const prisma = c.get('prisma')
    const service = new AdminService(prisma)
    const stores = await service.getAllStores()
    return c.json(stores, 200)
  } catch (error: any) {
    const isForbidden = error.message?.includes('Forbidden')
    return c.json({ error: error.message }, isForbidden ? 403 : 401) as any
  }
})

router.openapi(getAdminUsersRoute, async (c) => {
  try {
    requireSuperAdmin(c)
    const { query, role } = c.req.valid('query')
    const prisma = c.get('prisma')
    const service = new AdminService(prisma)
    const users = await service.getAllUsers(query, role)
    return c.json(users, 200)
  } catch (error: any) {
    const isForbidden = error.message?.includes('Forbidden')
    return c.json({ error: error.message }, isForbidden ? 403 : 401) as any
  }
})

router.openapi(updateAdminUserRoleRoute, async (c) => {
  try {
    requireSuperAdmin(c)
    const { id } = c.req.valid('param')
    const { role } = c.req.valid('json')
    const prisma = c.get('prisma')
    const service = new AdminService(prisma)
    const result = await service.updateUserRole(id, role)
    return c.json(result, 200)
  } catch (error: any) {
    const isForbidden = error.message?.includes('Forbidden')
    return c.json({ error: error.message }, isForbidden ? 403 : 400) as any
  }
})

router.openapi(getAdminTransactionsRoute, async (c) => {
  try {
    requireSuperAdmin(c)
    const prisma = c.get('prisma')
    const service = new AdminService(prisma)
    const transactions = await service.getGlobalTransactions(50)
    return c.json(transactions, 200)
  } catch (error: any) {
    const isForbidden = error.message?.includes('Forbidden')
    return c.json({ error: error.message }, isForbidden ? 403 : 401) as any
  }
})

export default {
  path: '/api/v1/admin',
  handler: router,
  priority: 1,
  name: 'Admin',
}
