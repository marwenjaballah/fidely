import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from '../../../types/index.js';
import {
  getStoresRoute,
  createStoreRoute,
  updateStoreRoute,
  getStoreCustomersRoute,
  getStoreStaffRoute,
  createStoreStaffRoute,
  updateStoreStaffRoute,
  changeStoreStaffPasswordRoute,
  deleteStoreStaffRoute,
  getStoreAnalyticsRoute,
  getStoreRewardsRoute,
  createStoreRewardRoute,
  updateStoreRewardRoute,
  deleteStoreRewardRoute,
} from './merchant.route.js';
import { MerchantService } from '../../../services/merchant.service.js';
import { requireUser } from '../../../utils/auth.js';

const router = new OpenAPIHono<Env>();

router.openapi(getStoresRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const stores = await service.getStores(user.id);
    return c.json(stores, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(createStoreRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const store = await service.createStore(user.id, data as {
      name: string
      slug?: string
      primaryColor?: string
      pointsPerTnd?: number
      logoUrl?: string | null
    });
    return c.json(store, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(updateStoreRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const store = await service.updateStore(id, user.id, data as {
      name?: string
      slug?: string
      primaryColor?: string
      pointsPerTnd?: number
      logoUrl?: string | null
    });
    return c.json(store, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(getStoreCustomersRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const customers = await service.getStoreCustomers(id, user.id);
    return c.json(customers, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(getStoreStaffRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const staff = await service.getStoreStaff(id, user.id);
    return c.json(staff, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(createStoreStaffRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const staff = await service.createStoreStaff(id, user.id, data as {
      fullName: string
      email: string
      password?: string
      phone?: string
    });
    return c.json(staff, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(updateStoreStaffRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id, staffId } = c.req.valid('param');
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const staff = await service.updateStoreStaff(id, user.id, staffId, data as {
      fullName?: string
      phone?: string
    });
    return c.json(staff, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(changeStoreStaffPasswordRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id, staffId } = c.req.valid('param');
  const { password } = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const result = await service.changeStoreStaffPassword(id, user.id, staffId, password);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(deleteStoreStaffRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id, staffId } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const result = await service.deleteStoreStaff(id, user.id, staffId);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(getStoreAnalyticsRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const analytics = await service.getStoreAnalytics(id, user.id);
    return c.json(analytics, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(getStoreRewardsRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const rewards = await service.getStoreRewards(id, user.id);
    return c.json(rewards, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(createStoreRewardRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const reward = await service.createStoreReward(id, user.id, data as {
      name: string;
      description?: string;
      pointsCost: number;
    });
    return c.json(reward, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(updateStoreRewardRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id, rewardId } = c.req.valid('param');
  const data = c.req.valid('json');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const reward = await service.updateStoreReward(id, user.id, rewardId, data as {
      name?: string;
      description?: string;
      pointsCost?: number;
      active?: boolean;
    });
    return c.json(reward, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

router.openapi(deleteStoreRewardRoute, async (c) => {
  const user = requireUser(c);
  if (user.role !== 'MERCHANT' && user.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Unauthorized' }, 401) as any;
  }
  
  const { id, rewardId } = c.req.valid('param');
  const prisma = c.get('prisma');
  const service = new MerchantService(prisma);
  
  try {
    const result = await service.deleteStoreReward(id, user.id, rewardId);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400) as any;
  }
});

export default {
  path: '/api/v1/merchant',
  handler: router,
  priority: 1,
  name: 'Merchant'
};
