import type { PrismaClient } from '@repo/database';
import { HTTPException } from 'hono/http-exception';

export class CustomerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves all memberships, points, rewards, active vouchers, and transactions for a customer.
   */
  async getCustomerOverview(customerId: string) {
    const memberships = await this.prisma.customerMembership.findMany({
      where: { customerId },
      include: {
        store: {
          include: {
            rewards: {
              where: { active: true },
            },
          },
        },
        vouchers: {
          include: {
            reward: true,
          },
          orderBy: { issuedAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const enrolledStoreIds = memberships.map((m) => m.storeId);

    // Fetch other active stores the customer can join
    const availableStores = await this.prisma.store.findMany({
      where: {
        id: {
          notIn: enrolledStoreIds.length > 0 ? enrolledStoreIds : ['00000000-0000-0000-0000-000000000000'],
        },
      },
      include: {
        rewards: {
          where: { active: true },
        },
      },
    });

    return {
      memberships: memberships.map((m) => ({
        id: m.id,
        storeId: m.storeId,
        storeName: m.store.name,
        storeSlug: m.store.slug,
        primaryColor: m.store.primaryColor,
        pointsPerTnd: m.store.pointsPerTnd,
        logoUrl: m.store.logoUrl,
        pointsBalance: m.pointsBalance,
        qrCodeToken: `${customerId}:${m.storeId}`,
        joinedAt: m.joinedAt.toISOString(),
        rewards: m.store.rewards.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          pointsCost: r.pointsCost,
          active: r.active,
        })),
        vouchers: m.vouchers.map((v) => ({
          id: v.id,
          code: v.code,
          status: v.status,
          issuedAt: v.issuedAt.toISOString(),
          usedAt: v.usedAt ? v.usedAt.toISOString() : null,
          rewardName: v.reward.name,
          pointsCost: v.reward.pointsCost,
        })),
        transactions: m.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amountTnd: t.amountTnd ? Number(t.amountTnd) : null,
          pointsAffected: t.pointsAffected,
          createdAt: t.createdAt.toISOString(),
        })),
      })),
      availableStores: availableStores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        primaryColor: s.primaryColor,
        pointsPerTnd: s.pointsPerTnd,
        logoUrl: s.logoUrl,
        rewardsCount: s.rewards.length,
      })),
    };
  }

  /**
   * Retrieves public details of a store by its slug.
   */
  async getStoreBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        rewards: {
          where: { active: true },
          orderBy: { pointsCost: 'asc' },
        },
      },
    });

    if (!store) {
      throw new HTTPException(404, { message: 'Store not found' });
    }

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      primaryColor: store.primaryColor,
      pointsPerTnd: store.pointsPerTnd,
      logoUrl: store.logoUrl,
      rewards: store.rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsCost: r.pointsCost,
        active: r.active,
      })),
    };
  }

  /**
   * Enrolls a customer in a store's loyalty program.
   */
  async joinStore(customerId: string, storeId: string, joinSource: string = 'STORE_QR') {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new HTTPException(404, { message: 'Store not found' });
    }

    const existing = await this.prisma.customerMembership.findUnique({
      where: {
        customerStoreIdx: {
          customerId,
          storeId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const membership = await this.prisma.customerMembership.create({
      data: {
        customerId,
        storeId,
        pointsBalance: 0,
        qrCodeToken: `${customerId}:${storeId}`,
        joinSource,
      },
    });

    return membership;
  }
}
