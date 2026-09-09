import { createRoute, z } from '@hono/zod-openapi';

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
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
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
          }),
        },
      },
    },
    400: {
      description: 'Insufficient points or invalid request',
    },
    404: {
      description: 'Reward not found',
    },
  },
});
