import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from '../../../types/index.js';
import {
  getCashierStoresRoute,
  issuePointsRoute,
  redeemRewardRoute,
} from './transactions.route.js';
import { TransactionsService } from '../../../services/transactions.service.js';
import { requireUser } from '../../../utils/auth.js';

const router = new OpenAPIHono<Env>();

router.openapi(getCashierStoresRoute, async (c) => {
  try {
    const user = requireUser(c);
    const prisma = c.get('prisma');
    const service = new TransactionsService(prisma);
    const stores = await service.getCashierStores(user.id, user.role);
    return c.json(stores, 200);
  } catch (error: any) {
    const status = error.status || error.statusCode || 401;
    return c.json({ error: error.message }, status) as any;
  }
});

router.openapi(issuePointsRoute, async (c) => {
  try {
    const user = requireUser(c);
    const { qrToken, amountTnd, storeId } = c.req.valid('json');
    const prisma = c.get('prisma');
    const service = new TransactionsService(prisma);

    const result = await service.issuePoints(user.id, user.role, qrToken, amountTnd, storeId);
    return c.json(result, 200);
  } catch (error: any) {
    const status = error.status || error.statusCode || 400;
    return c.json({ error: error.message }, status) as any;
  }
});

router.openapi(redeemRewardRoute, async (c) => {
  try {
    const user = requireUser(c);
    const { qrToken, rewardId, storeId } = c.req.valid('json');
    const prisma = c.get('prisma');
    const service = new TransactionsService(prisma);

    const result = await service.redeemReward(user.id, user.role, qrToken, rewardId, storeId);
    return c.json(result, 200);
  } catch (error: any) {
    const status = error.status || error.statusCode || 400;
    return c.json({ error: error.message }, status) as any;
  }
});

export default {
  path: '/api/v1/transactions',
  handler: router,
  priority: 1,
  name: 'Transactions',
};
