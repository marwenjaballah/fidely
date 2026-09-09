import { createRoute, z } from '@hono/zod-openapi'

export const getAdminMetricsRoute = createRoute({
  method: 'get',
  path: '/metrics',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Platform KPIs and daily trend series',
      content: {
        'application/json': {
          schema: z.object({
            kpis: z.object({
              totalUsers: z.number(),
              totalMerchants: z.number(),
              totalCashiers: z.number(),
              totalCustomers: z.number(),
              totalStores: z.number(),
              totalTransactions: z.number(),
              totalRewards: z.number(),
              totalVouchers: z.number(),
              totalPointsIssued: z.number(),
              totalPointsRedeemed: z.number(),
              totalVolumeTnd: z.number(),
            }),
            dailyTrends: z.array(
              z.object({
                date: z.string(),
                issued: z.number(),
                redeemed: z.number(),
                volumeTnd: z.number(),
              })
            ),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

export const getAdminStoresRoute = createRoute({
  method: 'get',
  path: '/stores',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of all registered stores',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              primaryColor: z.string(),
              pointsPerTnd: z.number(),
              createdAt: z.string(),
              owner: z.object({
                id: z.string(),
                email: z.string(),
                fullName: z.string().nullable(),
              }),
              stats: z.object({
                cashiersCount: z.number(),
                membersCount: z.number(),
                rewardsCount: z.number(),
                transactionsCount: z.number(),
              }),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

export const getAdminUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      query: z.string().optional(),
      role: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of platform users',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              email: z.string(),
              fullName: z.string().nullable(),
              phone: z.string().nullable().optional(),
              role: z.string(),
              createdAt: z.string(),
              stores: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  slug: z.string(),
                })
              ),
              cashierStores: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  slug: z.string(),
                })
              ),
              membershipsCount: z.number(),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

export const updateAdminUserRoleRoute = createRoute({
  method: 'put',
  path: '/users/{id}/role',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            role: z.enum(['SUPER_ADMIN', 'MERCHANT', 'CASHIER', 'CUSTOMER']),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User role updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            email: z.string(),
            role: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Bad Request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

export const getAdminTransactionsRoute = createRoute({
  method: 'get',
  path: '/transactions',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Global transaction audit stream',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              storeId: z.string(),
              storeName: z.string(),
              storeSlug: z.string(),
              type: z.string(),
              amountTnd: z.number().nullable(),
              pointsAffected: z.number(),
              createdAt: z.string(),
              customer: z.object({
                id: z.string(),
                email: z.string(),
                fullName: z.string().nullable(),
              }),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})
