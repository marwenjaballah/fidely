import { createRoute, z } from '@hono/zod-openapi';

const PublicMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable().optional(),
  available: z.boolean(),
});

const CustomerActiveOrderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  storeSlug: z.string().optional(),
  primaryColor: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  orderNumber: z.number(),
  status: z.enum(['PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  itemsSummary: z.string().nullable().optional(),
  createdAt: z.string(),
  readyAt: z.string().nullable().optional(),
});

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
                currency: z.string().optional().default('TND'),
                pointsPerTnd: z.number(),
                logoUrl: z.string().nullable().optional(),
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
                menuItems: z.array(PublicMenuItemSchema).optional().default([]),
                activeOrders: z.array(CustomerActiveOrderSchema).optional().default([]),
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
                currency: z.string().optional().default('TND'),
                pointsPerTnd: z.number(),
                logoUrl: z.string().nullable().optional(),
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

export const getStoreBySlugRoute = createRoute({
  method: 'get',
  path: '/store/{slug}',
  tags: ['Customer'],
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Store public profile',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            primaryColor: z.string(),
            currency: z.string().optional().default('TND'),
            pointsPerTnd: z.number(),
            welcomePoints: z.number().optional().default(0),
            selfServiceEnabled: z.boolean().optional().default(true),
            logoUrl: z.string().nullable().optional(),
            rewards: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable().optional(),
                pointsCost: z.number(),
                active: z.boolean(),
              })
            ),
            menuItems: z.array(PublicMenuItemSchema).optional().default([]),
          }),
        },
      },
    },
    404: {
      description: 'Store not found',
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

export const getCustomerActiveOrdersRoute = createRoute({
  method: 'get',
  path: '/active-orders',
  tags: ['Customer'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Active self-service orders for the customer across enrolled stores',
      content: {
        'application/json': {
          schema: z.array(CustomerActiveOrderSchema),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

export const acknowledgeCustomerOrderRoute = createRoute({
  method: 'post',
  path: '/orders/{orderId}/acknowledge',
  tags: ['Customer'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      orderId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Order acknowledged and marked completed',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            status: z.string(),
            completedAt: z.string(),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Order not found' },
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

export const refreshQrCodeRoute = createRoute({
  method: 'post',
  path: '/memberships/{membershipId}/refresh-qr',
  tags: ['Customer'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      membershipId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Refreshed dynamic QR code token successfully',
      content: {
        'application/json': {
          schema: z.object({
            membershipId: z.string(),
            qrCodeToken: z.string(),
            updatedAt: z.string(),
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
    404: {
      description: 'Membership not found',
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

