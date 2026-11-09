import { createRoute, z } from '@hono/zod-openapi';

export const getCashierStoresRoute = createRoute({
  method: 'get',
  path: '/my-stores',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Authorized stores for the authenticated cashier or merchant',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              primaryColor: z.string(),
              currency: z.string().default('TND'),
              pointsPerTnd: z.number(),
              selfServiceEnabled: z.boolean().optional().default(true),
              isOwner: z.boolean(),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

const ServiceOrderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  orderNumber: z.number(),
  status: z.enum(['PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  itemsSummary: z.string().nullable().optional(),
  customerName: z.string(),
  customerPhone: z.string().nullable().optional(),
  createdAt: z.string(),
  readyAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export const issuePointsRoute = createRoute({
  method: 'post',
  path: '/issue',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            qrToken: z.string().describe('The scanned QR code token of the customer'),
            amountTnd: z.number().positive().describe('The amount of TND spent'),
            storeId: z.string().optional().describe('Target store ID where the transaction takes place'),
            idempotencyKey: z.string().optional().describe('Unique idempotency key for offline sync deduplication'),
            trackOrder: z.boolean().optional().describe('Whether to queue a self-service order for ready notification'),
            itemsSummary: z.string().optional().describe('Summary of items ordered for self-service counter notification'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Points issued successfully',
      content: {
        'application/json': {
          schema: z.object({
            newBalance: z.number(),
            pointsIssued: z.number(),
            storeName: z.string(),
            customerName: z.string(),
            serviceOrder: ServiceOrderSchema.nullable().optional(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request or cross-store card mismatch',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden: Cashier not authorized for this store',
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

export const redeemRewardRoute = createRoute({
  method: 'post',
  path: '/redeem',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            qrToken: z.string().describe('The scanned QR code token of the customer'),
            rewardId: z.string().describe('The ID of the reward to redeem'),
            storeId: z.string().optional().describe('Target store ID where redemption takes place'),
            trackOrder: z.boolean().optional().describe('Whether to queue a self-service order for ready notification'),
            itemsSummary: z.string().optional().describe('Summary of reward/items ordered'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reward redeemed successfully',
      content: {
        'application/json': {
          schema: z.object({
            newBalance: z.number(),
            voucherCode: z.string(),
            rewardName: z.string(),
            storeName: z.string(),
            serviceOrder: ServiceOrderSchema.nullable().optional(),
          }),
        },
      },
    },
    400: {
      description: 'Insufficient points or invalid request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden: Cashier not authorized for this store',
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

export const getStoreRewardsRoute = createRoute({
  method: 'get',
  path: '/store-rewards',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      storeId: z.string().optional().describe('Target store ID to fetch rewards for'),
    }),
  },
  responses: {
    200: {
      description: 'Active rewards for the selected store',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable().optional(),
              pointsCost: z.number(),
            })
          ),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

export const getRecentTransactionsRoute = createRoute({
  method: 'get',
  path: '/recent',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      storeId: z.string().optional().describe('Target store ID to fetch recent transactions for'),
    }),
  },
  responses: {
    200: {
      description: 'Recent transactions processed at this store',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              type: z.string(),
              amountTnd: z.number().nullable(),
              pointsAffected: z.number(),
              createdAt: z.string(),
              customerName: z.string(),
              cashierId: z.string().optional(),
              cashierName: z.string().optional(),
            })
          ),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

export const lookupCustomerByPhoneRoute = createRoute({
  method: 'get',
  path: '/lookup-by-phone',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      phone: z.string().min(2).describe('Phone number digits to search'),
      storeId: z.string().describe('Active store ID to lookup membership and points balance'),
    }),
  },
  responses: {
    200: {
      description: 'Matching customers found',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              customerId: z.string(),
              id: z.string().optional(),
              fullName: z.string().nullable(),
              phone: z.string().nullable(),
              email: z.string(),
              membershipId: z.string(),
              pointsBalance: z.number(),
              qrCodeToken: z.string(),
              qrToken: z.string().optional(),
            })
          ),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

export const getCashierStoreMenuRoute = createRoute({
  method: 'get',
  path: '/store-menu',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      storeId: z.string().optional().describe('Target store ID to fetch menu items for'),
    }),
  },
  responses: {
    200: {
      description: 'Available menu items for the selected store',
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable().optional(),
              category: z.string(),
              price: z.number(),
              imageUrl: z.string().nullable().optional(),
              available: z.boolean(),
            })
          ),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

export const getActiveOrdersRoute = createRoute({
  method: 'get',
  path: '/orders',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      storeId: z.string().optional().describe('Target store ID to fetch active self-service orders for'),
    }),
  },
  responses: {
    200: {
      description: 'Active self-service orders (PREPARING and READY)',
      content: {
        'application/json': {
          schema: z.array(ServiceOrderSchema),
        },
      },
    },
    400: { description: 'Bad request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});

export const updateOrderStatusRoute = createRoute({
  method: 'post',
  path: '/orders/{orderId}/status',
  tags: ['Transactions'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      orderId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated self-service order status',
      content: {
        'application/json': {
          schema: ServiceOrderSchema,
        },
      },
    },
    400: { description: 'Bad request' },
    403: { description: 'Forbidden' },
    404: { description: 'Order not found' },
  },
});
