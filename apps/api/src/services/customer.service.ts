import type { PrismaClient } from '@repo/database';
import { HTTPException } from 'hono/http-exception';

export class CustomerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves all memberships, points, rewards, claimed vouchers, and transactions for a customer.
   */
  async getCustomerOverview(customerId: string) {
    // 1. Ensure user is enrolled in their referral store if they have one
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { referredByStoreId: true },
      });

      if (user?.referredByStoreId) {
        const existingMembership = await this.prisma.customerMembership.findUnique({
          where: {
            customerStoreIdx: {
              customerId,
              storeId: user.referredByStoreId,
            },
          },
        });

        if (!existingMembership) {
          const store = await this.prisma.store.findUnique({
            where: { id: user.referredByStoreId },
          });

          if (store && store.active) {
            await this.prisma.customerMembership.create({
              data: {
                customerId,
                storeId: store.id,
                pointsBalance: 0,
                qrCodeToken: `${customerId}:${store.id}`,
                joinSource: 'STORE_QR',
              },
            });
          }
        }
      }
    } catch (e) {
      console.warn('Auto-enroll in referral store notice:', e);
    }

    const cutoffOrders = new Date(Date.now() - 12 * 60 * 60 * 1000); // last 12 hours

    const memberships = await this.prisma.customerMembership.findMany({
      where: { customerId },
      include: {
        store: {
          include: {
            rewards: {
              where: { active: true },
            },
            menuItems: {
              where: { available: true },
              orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }, { name: 'asc' }],
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
        serviceOrders: {
          where: {
            status: { in: ['PREPARING', 'READY'] },
            createdAt: { gte: cutoffOrders },
          },
          orderBy: { createdAt: 'desc' },
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
        currency: m.store.currency || 'TND',
        pointsPerTnd: Number(m.store.pointsPerTnd),
        logoUrl: m.store.logoUrl,
        pointsBalance: m.pointsBalance,
        qrCodeToken: m.qrCodeToken || `${customerId}:${m.storeId}`,
        joinedAt: m.joinedAt.toISOString(),
        rewards: (m.store.rewards || []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          pointsCost: r.pointsCost,
          active: r.active,
        })),
        menuItems: ((m.store as any).menuItems || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          available: item.available,
        })),
        activeOrders: ((m as any).serviceOrders || []).map((o: any) => ({
          id: o.id,
          storeId: o.storeId,
          storeName: m.store.name,
          orderNumber: o.orderNumber,
          status: o.status,
          itemsSummary: o.itemsSummary,
          createdAt: o.createdAt.toISOString(),
          readyAt: o.readyAt ? o.readyAt.toISOString() : null,
        })),
        vouchers: (m.vouchers || []).map((v) => ({
          id: v.id,
          code: v.code,
          status: v.status,
          issuedAt: v.issuedAt.toISOString(),
          usedAt: v.usedAt ? v.usedAt.toISOString() : null,
          rewardName: v.reward.name,
          pointsCost: v.reward.pointsCost,
        })),
        transactions: (m.transactions || []).map((t) => ({
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
        currency: s.currency || 'TND',
        pointsPerTnd: Number(s.pointsPerTnd),
        logoUrl: s.logoUrl,
        rewardsCount: s.rewards.length,
      })),
    };
  }

  /**
   * Retrieves public details of a store by its slug.
   */
  async getStoreBySlug(slug: string) {
    const trimmed = slug.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    const store = await this.prisma.store.findFirst({
      where: {
        OR: [
          { slug: trimmed.toLowerCase() },
          ...(isUuid ? [{ id: trimmed }] : []),
        ],
      },
      include: {
        rewards: {
          where: { active: true },
          orderBy: { pointsCost: 'asc' },
        },
        menuItems: {
          where: { available: true },
          orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }, { name: 'asc' }],
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
      currency: store.currency || 'TND',
      pointsPerTnd: Number(store.pointsPerTnd),
      welcomePoints: (store as any).welcomePoints ?? 0,
      selfServiceEnabled: (store as any).selfServiceEnabled !== undefined ? Boolean((store as any).selfServiceEnabled) : true,
      logoUrl: store.logoUrl,
      rewards: (store.rewards || []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsCost: r.pointsCost,
        active: r.active,
      })),
      menuItems: ((store as any).menuItems || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        available: item.available,
      })),
    };
  }

  /**
   * Retrieves active self-service orders (PREPARING / READY) for the authenticated customer across all stores.
   */
  async getCustomerActiveOrders(customerId: string) {
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        membership: { customerId },
        status: { in: ['PREPARING', 'READY'] },
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      storeId: o.storeId,
      storeName: o.store.name,
      storeSlug: o.store.slug,
      primaryColor: o.store.primaryColor,
      logoUrl: o.store.logoUrl,
      orderNumber: o.orderNumber,
      status: o.status,
      itemsSummary: o.itemsSummary,
      createdAt: o.createdAt.toISOString(),
      readyAt: o.readyAt ? o.readyAt.toISOString() : null,
    }));
  }

  /**
   * Allows a customer to acknowledge/dismiss a READY order once they pick it up.
   */
  async acknowledgeOrder(customerId: string, orderId: string) {
    const order = await this.prisma.serviceOrder.findFirst({
      where: {
        id: orderId,
        membership: { customerId },
      },
    });

    if (!order) {
      throw new HTTPException(404, { message: 'Order not found for this customer.' });
    }

    const updated = await this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      completedAt: updated.completedAt ? updated.completedAt.toISOString() : new Date().toISOString(),
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

    const welcomeBonus = (store as any).welcomePoints > 0 ? (store as any).welcomePoints : 0;
    const membership = await this.prisma.customerMembership.create({
      data: {
        customerId,
        storeId,
        pointsBalance: welcomeBonus,
        qrCodeToken: `${customerId}:${storeId}`,
        joinSource,
        ...(welcomeBonus > 0
          ? {
              transactions: {
                create: {
                  storeId,
                  cashierId: store.ownerId,
                  type: 'earn',
                  pointsAffected: welcomeBonus,
                  amountTnd: 0,
                },
              },
            }
          : {}),
      },
    });

    return membership;
  }

  /**
   * Refreshes the QR code token for a customer's loyalty membership.
   */
  async refreshQrToken(customerId: string, membershipId: string) {
    const membership = await this.prisma.customerMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership || membership.customerId !== customerId) {
      throw new HTTPException(404, { message: 'Membership not found for this customer.' });
    }

    // Generate a fresh dynamic nonce
    const randomNonce = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
    const newQrCodeToken = `${customerId}:${membership.storeId}:${randomNonce}`;

    const updated = await this.prisma.customerMembership.update({
      where: { id: membershipId },
      data: {
        qrCodeToken: newQrCodeToken,
      },
    });

    return {
      membershipId: updated.id,
      qrCodeToken: updated.qrCodeToken || newQrCodeToken,
      updatedAt: new Date().toISOString(),
    };
  }
}

