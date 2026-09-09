import { createRoute, z } from '@hono/zod-openapi';

export const getCustomerOverviewRoute = createRoute({
  method: 'get',
  path: '/overview',
  tags: ['Customer'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Customer loyalty memberships, rewards, vouchers, and transactions',
      content: {
        'application/json': {
          schema: z.object({
            memberships: z.array(
              z.object({
                id: z.string(),
                storeId: z.string(),
                storeName: z.string(),
                storeSlug: z.string(),
                primaryColor: z.string(),
                pointsPerTnd: z.number(),
                pointsBalance: z.number(),
                qrCodeToken: z.string(),
                joinedAt: z.string(),
                rewards: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    description: z.string().nullable().optional(),
                    pointsCost: z.number(),
                    active: z.boolean(),
                  })
                ),
                vouchers: z.array(
                  z.object({
                    id: z.string(),
                    code: z.string(),
                    status: z.string(),
                    issuedAt: z.string(),
                    usedAt: z.string().nullable(),
                    rewardName: z.string(),
                    pointsCost: z.number(),
                  })
                ),
                transactions: z.array(
                  z.object({
                    id: z.string(),
                    type: z.string(),
                    amountTnd: z.number().nullable(),
                    pointsAffected: z.number(),
                    createdAt: z.string(),
                  })
                ),
              })
            ),
            availableStores: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                primaryColor: z.string(),
                pointsPerTnd: z.number(),
                rewardsCount: z.number(),
              })
            ),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

export const joinStoreRoute = createRoute({
  method: 'post',
  path: '/join',
  tags: ['Customer'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            storeId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Joined store loyalty program successfully',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            customerId: z.string(),
            storeId: z.string(),
            pointsBalance: z.number(),
            qrCodeToken: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});
