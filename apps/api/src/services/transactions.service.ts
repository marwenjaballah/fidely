import type { PrismaClient, Prisma, Store } from '@repo/database';
import { HTTPException } from 'hono/http-exception';
import { normalizePhone, getPhoneSignificantDigits } from '../utils/phone.js';

export class TransactionsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves all stores where the user is an authorized cashier, store owner, or super admin.
   */
  async getCashierStores(userId: string, userRole?: string) {
    if (userRole === 'SUPER_ADMIN') {
      const allStores = await this.prisma.store.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      return allStores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        primaryColor: s.primaryColor,
        currency: s.currency || 'TND',
        pointsPerTnd: Number(s.pointsPerTnd),
        selfServiceEnabled: s.selfServiceEnabled !== undefined ? Boolean(s.selfServiceEnabled) : true,
        isOwner: true,
      }));
    }

    const stores = await this.prisma.store.findMany({
      where: {
        active: true,
        OR: [
          { ownerId: userId },
          { cashiers: { some: { id: userId } } },
        ],
      },
      orderBy: { name: 'asc' },
    });

    return stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      primaryColor: s.primaryColor,
      currency: s.currency || 'TND',
      pointsPerTnd: Number(s.pointsPerTnd),
      selfServiceEnabled: s.selfServiceEnabled !== undefined ? Boolean(s.selfServiceEnabled) : true,
      isOwner: s.ownerId === userId,
    }));
  }

  /**
   * Validates that the cashier is authorized to perform transactions for the target store.
   */
  private async resolveAndValidateCashierStore(
    userId: string,
    userRole: string | undefined,
    requestedStoreId?: string
  ): Promise<Store> {
    // 1. If requestedStoreId is provided, verify cashier has access
    if (requestedStoreId) {
      const store = await this.prisma.store.findUnique({
        where: { id: requestedStoreId },
        include: { cashiers: { where: { id: userId } } },
      });

      if (!store || !store.active) {
        throw new HTTPException(404, { message: 'Store not found or inactive.' });
      }

      if (userRole !== 'SUPER_ADMIN' && store.ownerId !== userId && store.cashiers.length === 0) {
        throw new HTTPException(403, {
          message: `Forbidden: You are not authorized to process transactions for '${store.name}'.`,
        });
      }

      return store;
    }

    // 2. If no storeId requested, resolve cashier's assigned stores
    const authorizedStores = await this.prisma.store.findMany({
      where: {
        active: true,
        OR: [
          { ownerId: userId },
          { cashiers: { some: { id: userId } } },
        ],
      },
    });

    if (authorizedStores.length === 0) {
      if (userRole === 'SUPER_ADMIN') {
        const defaultStore = await this.prisma.store.findFirst({ where: { active: true } });
        if (defaultStore) return defaultStore;
      }
      throw new HTTPException(403, {
        message: 'Forbidden: You are not assigned to any active store. Please contact your store manager.',
      });
    }

    if (authorizedStores.length === 1) {
      const singleStore = authorizedStores[0];
      if (singleStore) return singleStore;
    }

    throw new HTTPException(400, {
      message: 'Multiple stores assigned. Please select an active store on your cashier terminal.',
    });
  }

  /**
   * Resolves the customer and validates against cross-store QR token mismatches.
   */
  private async resolveCustomerAndMembership(
    qrToken: string,
    targetStore: { id: string; name: string },
    allowPhone: boolean = true
  ) {
    let customerId: string | null = null;
    let qrStoreId: string | null = null;
    const trimmedToken = qrToken.trim();

    // 1. First priority: Exact match on unique qrCodeToken in CustomerMembership
    const membershipByToken = await this.prisma.customerMembership.findUnique({
      where: { qrCodeToken: trimmedToken },
      include: { customer: true, store: true },
    });

    if (membershipByToken) {
      customerId = membershipByToken.customerId;
      qrStoreId = membershipByToken.storeId;
    } else {
      // 2. Check if token format is "customerId:storeId" or "customerId:storeId:nonce"
      if (trimmedToken.includes(':')) {
        const parts = trimmedToken.split(':');
        const candidateCustomerId = parts[0] || null;
        const candidateStoreId = parts[1] || null;

        if (candidateCustomerId && candidateStoreId) {
          const existing = await this.prisma.customerMembership.findUnique({
            where: {
              customerStoreIdx: {
                customerId: candidateCustomerId,
                storeId: candidateStoreId,
              },
            },
          });

          if (existing) {
            // If the membership has an active rotated token that differs from the scanned token, reject as expired
            if (existing.qrCodeToken && existing.qrCodeToken !== trimmedToken) {
              throw new HTTPException(400, {
                message: 'This loyalty QR pass is expired or has been regenerated. Please ask the customer to display their updated pass.',
              });
            }
            customerId = candidateCustomerId;
            qrStoreId = candidateStoreId;
          }
        }
      }

      // 3. Fallback: Raw customer UUID
      if (!customerId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedToken);
        if (isUuid) {
          const customerById = await this.prisma.user.findUnique({
            where: { id: trimmedToken },
          });
          if (customerById) {
            customerId = customerById.id;
          }
        }
      }

      // 4. Fallback: Phone number matching (only allowed for point earning, never for redemption)
      if (!customerId && allowPhone) {
        const normalized = normalizePhone(trimmedToken);
        const digits = trimmedToken.replace(/\D/g, '');

        // Require at least 8 digits to prevent prefix collisions
        if (digits.length >= 8) {
          const significantDigits = getPhoneSignificantDigits(digits);
          const customerByPhone = await this.prisma.user.findFirst({
            where: {
              OR: [
                ...(normalized ? [{ phone: normalized }] : []),
                { phone: { endsWith: significantDigits } },
              ],
            },
          });
          if (customerByPhone) {
            customerId = customerByPhone.id;
          }
        }
      }
    }

    if (!customerId) {
      if (!allowPhone) {
        throw new HTTPException(400, {
          message: 'Invalid customer QR pass. Rewards can only be redeemed by scanning customer QR pass.',
        });
      }
      throw new HTTPException(400, {
        message: 'Invalid customer pass or phone number. For phone search, please enter at least 8 digits.',
      });
    }

    // Verify customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new HTTPException(404, { message: 'Customer account not found.' });
    }

    // CROSS-STORE DETECTION:
    // If the scanned QR code was explicitly created for another store (qrStoreId !== targetStore.id)
    if (qrStoreId && qrStoreId !== targetStore.id) {
      const otherStore = await this.prisma.store.findUnique({
        where: { id: qrStoreId },
        select: { name: true },
      });

      const otherStoreName = otherStore?.name || 'another store';
      throw new HTTPException(400, {
        message: `Cross-store card mismatch: Scanned loyalty pass is for '${otherStoreName}'. Please ask the customer to present their pass for '${targetStore.name}'.`,
      });
    }

    return { customer, customerId };
  }

  /**
   * Helper to create a ServiceOrder inside a Prisma transaction with a daily sequential orderNumber (#101, #102, ...).
   */
  private async createServiceOrderInTx(
    tx: Prisma.TransactionClient,
    params: {
      storeId: string;
      storeName: string;
      membershipId: string;
      cashierId: string;
      transactionId?: string;
      customerName: string;
      itemsSummary?: string | null;
    }
  ) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let nextOrderNumber = 101;
    if ((tx as any).serviceOrder) {
      const latestOrder = await (tx as any).serviceOrder.findFirst({
        where: {
          storeId: params.storeId,
          createdAt: { gte: startOfToday },
        },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      if (latestOrder && typeof latestOrder.orderNumber === 'number') {
        nextOrderNumber = latestOrder.orderNumber + 1;
      }

      const createdOrder = await (tx as any).serviceOrder.create({
        data: {
          storeId: params.storeId,
          membershipId: params.membershipId,
          cashierId: params.cashierId,
          transactionId: params.transactionId || null,
          orderNumber: nextOrderNumber,
          status: 'PREPARING',
          itemsSummary: params.itemsSummary?.trim() || null,
        },
      });

      return {
        id: createdOrder.id,
        storeId: createdOrder.storeId,
        storeName: params.storeName,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status as 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED',
        itemsSummary: createdOrder.itemsSummary || null,
        customerName: params.customerName,
        createdAt: createdOrder.createdAt ? createdOrder.createdAt.toISOString() : new Date().toISOString(),
        readyAt: createdOrder.readyAt ? createdOrder.readyAt.toISOString() : null,
      };
    }

    return null;
  }

  /**
   * Issues points based on store loyalty multiplier.
   */
  async issuePoints(
    cashierId: string,
    cashierRole: string | undefined,
    qrToken: string,
    amountTnd: number,
    storeId?: string,
    idempotencyKey?: string,
    options?: {
      trackOrder?: boolean;
      itemsSummary?: string;
    }
  ) {
    if (amountTnd <= 0) {
      throw new HTTPException(400, { message: 'Transaction amount must be greater than 0.' });
    }

    // 1. Authorize cashier and resolve store
    const store = await this.resolveAndValidateCashierStore(cashierId, cashierRole, storeId);

    // 2. Check for duplicate offline-synced transaction if idempotencyKey is supplied
    if (idempotencyKey && idempotencyKey.trim()) {
      const existingTx = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: idempotencyKey.trim() },
        include: { store: true, membership: { include: { customer: true } } },
      });

      if (existingTx) {
        return {
          newBalance: existingTx.membership.pointsBalance,
          pointsIssued: existingTx.pointsAffected,
          storeName: existingTx.store.name,
          customerName: existingTx.membership.customer.fullName || existingTx.membership.customer.email,
          serviceOrder: null,
        };
      }
    }

    // 3. Validate customer and protect against cross-store card abuse
    const { customer, customerId } = await this.resolveCustomerAndMembership(qrToken, store);

    // 4. Calculate points according to this store's multiplier
    const pointsPerTnd = Number(store.pointsPerTnd || 10);
    const pointsToIssue = Math.max(1, Math.round(amountTnd * pointsPerTnd));

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Find or create customer membership strictly for target store
      let membership = await tx.customerMembership.findUnique({
        where: {
          customerStoreIdx: {
            customerId,
            storeId: store.id,
          },
        },
      });

      if (!membership) {
        membership = await tx.customerMembership.create({
          data: {
            customerId,
            storeId: store.id,
            pointsBalance: 0,
            qrCodeToken: `${customerId}:${store.id}`,
          },
        });
      }

      // Concurrency-safe atomic increment
      const updatedMembership = await tx.customerMembership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: { increment: pointsToIssue },
        },
      });

      // Log transaction with exact store, cashier, and idempotency key
      const createdTx = await tx.transaction.create({
        data: {
          storeId: store.id,
          cashierId,
          membershipId: membership.id,
          type: 'earn',
          amountTnd,
          pointsAffected: pointsToIssue,
          idempotencyKey: idempotencyKey ? idempotencyKey.trim() : null,
        },
      });

      const customerDisplayName = customer.fullName || customer.email?.split('@')[0] || 'Customer';
      let serviceOrder = null;

      if (options?.trackOrder) {
        serviceOrder = await this.createServiceOrderInTx(tx, {
          storeId: store.id,
          storeName: store.name,
          membershipId: membership.id,
          cashierId,
          transactionId: createdTx?.id,
          customerName: customerDisplayName,
          itemsSummary: options.itemsSummary,
        });
      }

      return {
        newBalance: updatedMembership.pointsBalance,
        pointsIssued: pointsToIssue,
        storeName: store.name,
        customerName: customer.fullName || customer.email,
        serviceOrder,
      };
    });
  }

  /**
   * Redeems a specific reward strictly scoped to the cashier's store.
   */
  async redeemReward(
    cashierId: string,
    cashierRole: string | undefined,
    qrToken: string,
    rewardId: string,
    storeId?: string,
    options?: {
      trackOrder?: boolean;
      itemsSummary?: string;
    }
  ) {
    // 1. Authorize cashier and resolve store
    const store = await this.resolveAndValidateCashierStore(cashierId, cashierRole, storeId);

    // 2. Validate reward belongs to this store OR is a custom points deduction
    let reward: any = null;
    let pointsCost = 0;
    let rewardName = 'Reward';

    // Check if rewardId is custom points deduction or numeric amount (e.g. "50", "custom:50", "points:50")
    const customPointsMatch = rewardId.trim().match(/^(?:points:|custom:)?(\d+)$/i);
    if (customPointsMatch && customPointsMatch[1]) {
      pointsCost = parseInt(customPointsMatch[1], 10);
      if (pointsCost <= 0) {
        throw new HTTPException(400, { message: 'Points to deduct must be greater than 0.' });
      }
      rewardName = `${pointsCost} Points Deduction`;
    } else {
      // Check store reward catalog
      reward = await this.prisma.reward.findUnique({
        where: { id: rewardId.trim() },
      });

      if (!reward || reward.storeId !== store.id || !reward.active) {
        throw new HTTPException(404, {
          message: `Reward not found or does not belong to '${store.name}'.`,
        });
      }
      pointsCost = reward.pointsCost;
      rewardName = reward.name;
    }

    // 3. Validate customer and cross-store pass (allowPhone = false: redemptions require optical QR pass)
    const { customer, customerId } = await this.resolveCustomerAndMembership(qrToken, store, false);

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const membership = await tx.customerMembership.findUnique({
        where: {
          customerStoreIdx: {
            customerId,
            storeId: store.id,
          },
        },
      });

      if (!membership || membership.pointsBalance < pointsCost) {
        const currentBalance = membership?.pointsBalance || 0;
        throw new HTTPException(400, {
          message: `Insufficient points: Customer has ${currentBalance} pts, but '${rewardName}' requires ${pointsCost} pts.`,
        });
      }

      // Concurrency-safe atomic deduction with positive-balance guard
      const updateResult = await tx.customerMembership.updateMany({
        where: {
          id: membership.id,
          pointsBalance: { gte: pointsCost },
        },
        data: {
          pointsBalance: { decrement: pointsCost },
        },
      });

      if (updateResult.count === 0) {
        throw new HTTPException(400, {
          message: `Insufficient points or concurrent transaction in progress. Please refresh and try again.`,
        });
      }

      const updatedMembership = await tx.customerMembership.findUniqueOrThrow({
        where: { id: membership.id },
      });

      // Log transaction
      const createdTx = await tx.transaction.create({
        data: {
          storeId: store.id,
          cashierId,
          membershipId: membership.id,
          type: 'redeem',
          pointsAffected: -pointsCost,
        },
      });

      // Create Voucher for customer marked as used immediately (if redeeming a catalog reward)
      let voucherCode = `DEDUCT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      if (reward) {
        const now = new Date();
        const voucher = await tx.voucher.create({
          data: {
            membershipId: membership.id,
            rewardId: reward.id,
            code: `VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            status: 'used',
            issuedAt: now,
            usedAt: now,
          },
        });
        voucherCode = voucher.code;
      }

      const customerDisplayName = customer.fullName || customer.email?.split('@')[0] || 'Customer';
      let serviceOrder = null;

      if (options?.trackOrder) {
        serviceOrder = await this.createServiceOrderInTx(tx, {
          storeId: store.id,
          storeName: store.name,
          membershipId: membership.id,
          cashierId,
          transactionId: createdTx?.id,
          customerName: customerDisplayName,
          itemsSummary: options.itemsSummary || `Reward: ${rewardName}`,
        });
      }

      return {
        newBalance: updatedMembership.pointsBalance,
        voucherCode,
        rewardName,
        storeName: store.name,
        serviceOrder,
      };
    });
  }

  /**
   * Retrieves available menu items for the target store for the cashier POS.
   */
  async getStoreMenu(userId: string, userRole: string | undefined, storeId?: string) {
    const store = await this.resolveAndValidateCashierStore(userId, userRole, storeId);
    const items = await this.prisma.menuItem.findMany({
      where: { storeId: store.id, available: true },
      orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }, { name: 'asc' }],
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      available: item.available,
    }));
  }

  /**
   * Retrieves active self-service orders (PREPARING and READY) for the cashier's store.
   */
  async getActiveOrders(userId: string, userRole: string | undefined, storeId?: string) {
    const store = await this.resolveAndValidateCashierStore(userId, userRole, storeId);
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000); // last 12 hours

    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        storeId: store.id,
        status: { in: ['PREPARING', 'READY'] },
        createdAt: { gte: cutoff },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      include: {
        membership: {
          include: {
            customer: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      storeId: o.storeId,
      storeName: store.name,
      orderNumber: o.orderNumber,
      status: o.status,
      itemsSummary: o.itemsSummary,
      customerName:
        o.membership?.customer?.fullName ||
        o.membership?.customer?.email?.split('@')[0] ||
        'Customer',
      customerPhone: o.membership?.customer?.phone || null,
      createdAt: o.createdAt.toISOString(),
      readyAt: o.readyAt ? o.readyAt.toISOString() : null,
    }));
  }

  /**
   * Updates the status of a self-service order (e.g., PREPARING -> READY -> COMPLETED).
   */
  async updateOrderStatus(
    userId: string,
    userRole: string | undefined,
    orderId: string,
    status: 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  ) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        membership: {
          include: {
            customer: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new HTTPException(404, { message: 'Order not found.' });
    }

    const store = await this.resolveAndValidateCashierStore(userId, userRole, order.storeId);
    const now = new Date();

    const updated = await this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'READY' ? { readyAt: now } : {}),
        ...(status === 'COMPLETED' || status === 'CANCELLED' ? { completedAt: now } : {}),
      },
    });

    return {
      id: updated.id,
      storeId: updated.storeId,
      storeName: store.name,
      orderNumber: updated.orderNumber,
      status: updated.status,
      itemsSummary: updated.itemsSummary,
      customerName:
        order.membership?.customer?.fullName ||
        order.membership?.customer?.email?.split('@')[0] ||
        'Customer',
      createdAt: updated.createdAt.toISOString(),
      readyAt: updated.readyAt ? updated.readyAt.toISOString() : null,
      completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
    };
  }

  /**
   * Retrieves active rewards for the target store for the cashier.
   */
  async getStoreRewards(userId: string, userRole: string | undefined, storeId?: string) {
    const store = await this.resolveAndValidateCashierStore(userId, userRole, storeId);
    const rewards = await this.prisma.reward.findMany({
      where: { storeId: store.id, active: true },
      orderBy: { pointsCost: 'asc' },
    });
    return rewards.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      pointsCost: r.pointsCost,
    }));
  }

  /**
   * Retrieves the most recent transactions processed at the store.
   */
  async getRecentTransactions(
    userId: string,
    userRole: string | undefined,
    storeId?: string,
    limit: number = 10
  ) {
    const store = await this.resolveAndValidateCashierStore(userId, userRole, storeId);
    
    // Each cashier has their own shift history: filter by cashierId for CASHIER role
    const where: Prisma.TransactionWhereInput = { storeId: store.id };
    if (userRole === 'CASHIER') {
      where.cashierId = userId;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        membership: {
          include: {
            customer: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        cashier: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amountTnd: t.amountTnd ? Number(t.amountTnd) : null,
      pointsAffected: t.pointsAffected,
      createdAt: t.createdAt.toISOString(),
      customerName: t.membership?.customer?.fullName || t.membership?.customer?.email?.split('@')[0] || 'Customer',
      cashierId: t.cashierId,
      cashierName: t.cashier?.fullName || t.cashier?.email?.split('@')[0] || 'Cashier',
    }));
  }

  /**
   * Looks up a customer and their store membership strictly by phone number digits.
   */
  async lookupCustomerByPhone(
    userId: string,
    userRole: string | undefined,
    storeId: string,
    phoneQuery: string
  ) {
    const store = await this.resolveAndValidateCashierStore(userId, userRole, storeId);
    const cleanedDigits = phoneQuery.replace(/\D/g, '');
    if (!cleanedDigits || cleanedDigits.length < 3) {
      return [];
    }

    const significantDigits = getPhoneSignificantDigits(cleanedDigits);
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { phone: { contains: cleanedDigits } },
          { phone: { endsWith: significantDigits } },
        ],
      },
      take: 8,
      include: {
        memberships: {
          where: { storeId: store.id },
        },
      },
    });

    const results = [];
    for (const u of users) {
      const membership = u.memberships[0];

      results.push({
        customerId: u.id,
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        membershipId: membership?.id || '',
        pointsBalance: membership?.pointsBalance ?? 0,
        qrCodeToken: membership?.qrCodeToken || `${u.id}:${store.id}`,
        qrToken: membership?.qrCodeToken || `${u.id}:${store.id}`,
      });
    }

    return results;
  }
}
