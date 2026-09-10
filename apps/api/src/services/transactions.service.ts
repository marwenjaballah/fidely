import type { PrismaClient, Prisma, Store } from '@repo/database';
import { HTTPException } from 'hono/http-exception';

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
        pointsPerTnd: Number(s.pointsPerTnd),
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
      pointsPerTnd: Number(s.pointsPerTnd),
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
    targetStore: { id: string; name: string }
  ) {
    let customerId: string | null = null;
    let qrStoreId: string | null = null;

    // Check format: "customerId:storeId"
    if (qrToken.includes(':')) {
      const parts = qrToken.split(':');
      customerId = parts[0] || null;
      qrStoreId = parts[1] || null;
    } else {
      // Check if it's a raw qrCodeToken from CustomerMembership
      const existingMembership = await this.prisma.customerMembership.findUnique({
        where: { qrCodeToken: qrToken },
        include: { customer: true, store: true },
      });

      if (existingMembership) {
        customerId = existingMembership.customerId;
        qrStoreId = existingMembership.storeId;
      } else {
        // Assume raw customer ID
        customerId = qrToken;
      }
    }

    if (!customerId) {
      throw new HTTPException(400, { message: 'Invalid customer QR pass.' });
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
   * Issues points based on store loyalty multiplier.
   */
  async issuePoints(
    cashierId: string,
    cashierRole: string | undefined,
    qrToken: string,
    amountTnd: number,
    storeId?: string
  ) {
    if (amountTnd <= 0) {
      throw new HTTPException(400, { message: 'Transaction amount must be greater than 0.' });
    }

    // 1. Authorize cashier and resolve store
    const store = await this.resolveAndValidateCashierStore(cashierId, cashierRole, storeId);

    // 2. Validate customer and protect against cross-store card abuse
    const { customer, customerId } = await this.resolveCustomerAndMembership(qrToken, store);

    // 3. Calculate points according to this store's multiplier
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

      // Add points
      const updatedMembership = await tx.customerMembership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: membership.pointsBalance + pointsToIssue,
        },
      });

      // Log transaction with exact store and cashier
      await tx.transaction.create({
        data: {
          storeId: store.id,
          cashierId,
          membershipId: membership.id,
          type: 'earn',
          amountTnd,
          pointsAffected: pointsToIssue,
        },
      });

      return {
        newBalance: updatedMembership.pointsBalance,
        pointsIssued: pointsToIssue,
        storeName: store.name,
        customerName: customer.fullName || customer.email,
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
    storeId?: string
  ) {
    // 1. Authorize cashier and resolve store
    const store = await this.resolveAndValidateCashierStore(cashierId, cashierRole, storeId);

    // 2. Validate reward belongs to this store
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || reward.storeId !== store.id || !reward.active) {
      throw new HTTPException(404, {
        message: `Reward not found or does not belong to '${store.name}'.`,
      });
    }

    // 3. Validate customer and cross-store pass
    const { customer, customerId } = await this.resolveCustomerAndMembership(qrToken, store);

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const membership = await tx.customerMembership.findUnique({
        where: {
          customerStoreIdx: {
            customerId,
            storeId: store.id,
          },
        },
      });

      if (!membership || membership.pointsBalance < reward.pointsCost) {
        const currentBalance = membership?.pointsBalance || 0;
        throw new HTTPException(400, {
          message: `Insufficient points: Customer has ${currentBalance} pts, but '${reward.name}' requires ${reward.pointsCost} pts.`,
        });
      }

      // Deduct points
      const updatedMembership = await tx.customerMembership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: membership.pointsBalance - reward.pointsCost,
        },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          storeId: store.id,
          cashierId,
          membershipId: membership.id,
          type: 'redeem',
          pointsAffected: -reward.pointsCost,
        },
      });

      // Create Voucher for customer
      const voucher = await tx.voucher.create({
        data: {
          membershipId: membership.id,
          rewardId: reward.id,
          code: `VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'active',
        },
      });

      return {
        newBalance: updatedMembership.pointsBalance,
        voucherCode: voucher.code,
        rewardName: reward.name,
        storeName: store.name,
      };
    });
  }
}
