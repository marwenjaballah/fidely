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
              pointsPerTnd: z.number(),
              isOwner: z.boolean(),
            })
          ),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
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
    404: {
      description: 'Reward not found',
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
