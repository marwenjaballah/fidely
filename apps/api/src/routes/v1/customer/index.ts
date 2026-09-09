import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from '../../../types/index.js';
import { getCustomerOverviewRoute, joinStoreRoute } from './customer.route.js';
import { CustomerService } from '../../../services/customer.service.js';
import { requireUser } from '../../../utils/auth.js';

const router = new OpenAPIHono<Env>();

router.openapi(getCustomerOverviewRoute, async (c) => {
  const user = requireUser(c);
  const prisma = c.get('prisma');
  const service = new CustomerService(prisma);

  try {
    const overview = await service.getCustomerOverview(user.id);
    return c.json(overview, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(joinStoreRoute, async (c) => {
  const user = requireUser(c);
  const { storeId } = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new CustomerService(prisma);

  try {
    const membership = await service.joinStore(user.id, storeId);
    return c.json(membership, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

export default {
  path: '/api/v1/customer',
  handler: router,
  priority: 1,
  name: 'Customer',
};
