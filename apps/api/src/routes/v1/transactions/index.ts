import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from '../../../types/index.js';
import { issuePointsRoute, redeemRewardRoute } from './transactions.route.js';
import { TransactionsService } from '../../../services/transactions.service.js';

const router = new OpenAPIHono<Env>();

router.openapi(issuePointsRoute, async (c) => {
  const { qrToken, amountTnd } = c.req.valid('json');
  const prisma = c.get('prisma');

  // For this implementation, we assume the qrToken contains the customerId and storeId.
  // In a real production app, you would decrypt/verify a JWT or signed token.
  // We'll mock the extraction here for now.
  const [customerId, storeId] = qrToken.split(':');
  if (!customerId || !storeId) {
    return c.json({ error: 'Invalid QR token' }, 400);
  }

  const service = new TransactionsService(prisma);

  try {
    const cashierId = 'mock-cashier-id'; // To be replaced with real auth later
    const result = await service.issuePoints(customerId, storeId, cashierId, amountTnd);
    return c.json({
      newBalance: result.newBalance,
      pointsIssued: result.pointsIssued,
    }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

router.openapi(redeemRewardRoute, async (c) => {
  const { qrToken, rewardId } = c.req.valid('json');
  const prisma = c.get('prisma');

  const [customerId, storeId] = qrToken.split(':');
  if (!customerId || !storeId) {
    return c.json({ error: 'Invalid QR token' }, 400);
  }

  const service = new TransactionsService(prisma);

  try {
    const cashierId = 'mock-cashier-id'; // To be replaced with real auth later
    const result = await service.redeemReward(customerId, storeId, cashierId, rewardId);
    return c.json({
      newBalance: result.newBalance,
      voucherCode: result.voucher.code,
    }, 200);
  } catch (error: any) {
    const status = error.statusCode || 400;
    return c.json({ error: error.message }, status);
  }
});

export default {
  path: '/api/v1/transactions',
  handler: router,
  priority: 1,
  name: 'Transactions'
};
