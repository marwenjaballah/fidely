import type { PrismaClient } from '@repo/database';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { generateUniqueSlug } from '../lib/slug.js';
import { normalizePhone, getPhoneSignificantDigits } from '../utils/phone.js';

export class MerchantService {
  constructor(private prisma: PrismaClient, private supabaseAdmin?: any) {}

  async getStores(merchantId: string) {
    const stores = await this.prisma.store.findMany({
      where: { ownerId: merchantId },
    });
    return stores.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      primaryColor: s.primaryColor || '#000000',
      currency: s.currency || 'TND',
      pointsPerTnd: Number(s.pointsPerTnd) || 10,
      welcomePoints: Number(s.welcomePoints) || 0,
      logoUrl: s.logoUrl || null,
      active: s.active,
      createdAt: s.createdAt,
    }));
  }

  async createStore(merchantId: string, data: { name: string; slug?: string; primaryColor?: string; currency?: string; pointsPerTnd?: number; welcomePoints?: number; logoUrl?: string | null }) {
    const candidate = data.slug && data.slug.trim() ? data.slug : data.name;
    const uniqueSlug = await generateUniqueSlug(this.prisma, candidate);

    const store = await this.prisma.store.create({
      data: {
        ownerId: merchantId,
        name: data.name,
        slug: uniqueSlug,
        primaryColor: data.primaryColor || '#000000',
        currency: (data.currency && data.currency.trim()) ? data.currency.trim().toUpperCase() : 'TND',
        pointsPerTnd: data.pointsPerTnd || 10,
        welcomePoints: data.welcomePoints || 0,
        logoUrl: data.logoUrl ?? null,
      }
    });

    return {
      ...store,
      currency: store.currency || 'TND',
      pointsPerTnd: Number(store.pointsPerTnd) || 10,
      welcomePoints: Number((store as any).welcomePoints) || 0,
    };
  }

  async updateStore(storeId: string, merchantId: string, data: { name?: string; slug?: string; primaryColor?: string; currency?: string; pointsPerTnd?: number; welcomePoints?: number; logoUrl?: string | null }) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    let nextSlug = store.slug;
    if (data.slug && data.slug.trim() && data.slug.trim() !== store.slug) {
      nextSlug = await generateUniqueSlug(this.prisma, data.slug.trim(), storeId);
    } else if (data.name && data.name.trim() && data.name.trim() !== store.name && !data.slug) {
      nextSlug = await generateUniqueSlug(this.prisma, data.name.trim(), storeId);
    }

    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        slug: nextSlug,
        ...(data.primaryColor !== undefined ? { primaryColor: data.primaryColor } : {}),
        ...(data.currency !== undefined ? { currency: data.currency.trim().toUpperCase() || 'TND' } : {}),
        ...(data.pointsPerTnd !== undefined ? { pointsPerTnd: data.pointsPerTnd } : {}),
        ...(data.welcomePoints !== undefined ? { welcomePoints: data.welcomePoints } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
      },
    });

    return {
      ...updated,
      currency: updated.currency || 'TND',
      pointsPerTnd: Number(updated.pointsPerTnd) || 10,
      welcomePoints: Number((updated as any).welcomePoints) || 0,
    };
  }

  async getStoreCustomers(
    storeId: string,
    merchantId: string,
    options?: { page?: number; limit?: number; query?: string }
  ) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const where: any = { storeId };
    if (options?.query && options.query.trim()) {
      const q = options.query.trim();
      where.customer = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      };
    }

    const take = options?.limit ? Math.min(Math.max(1, options.limit), 100) : undefined;
    const skip = options?.page && take ? (Math.max(1, options.page) - 1) * take : undefined;

    const memberships = await this.prisma.customerMembership.findMany({
      where,
      include: { customer: true },
      orderBy: { joinedAt: 'desc' },
      ...(take ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    });

    return memberships.map((m) => ({
      customerId: m.customer.id,
      fullName: m.customer.fullName,
      email: m.customer.email,
      pointsBalance: m.pointsBalance,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async getStoreStaff(storeId: string, merchantId: string) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const staff = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { cashiers: true },
    });

    return staff?.cashiers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt.toISOString(),
    })) || [];
  }

  async getAvailableStoreStaff(storeId: string, merchantId: string) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    // Find all cashiers who belong to any store owned by this merchant,
    // but are NOT yet assigned to this store
    const availableCashiers = await this.prisma.user.findMany({
      where: {
        role: 'CASHIER',
        cashierStores: {
          some: { ownerId: merchantId },
          none: { id: storeId },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        cashierStores: {
          where: { ownerId: merchantId },
          select: { id: true, name: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return availableCashiers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt.toISOString(),
      assignedStores: c.cashierStores,
    }));
  }

  async assignStoreStaff(storeId: string, merchantId: string, staffId: string) {
    // Verify ownership of the store
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
      include: {
        cashiers: { where: { id: staffId } },
      },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    if (store.cashiers.length > 0) {
      throw new Error('Cashier is already assigned to this store');
    }

    // Verify cashier exists and belongs to at least one store owned by this merchant
    const staffUser = await this.prisma.user.findFirst({
      where: {
        id: staffId,
        role: 'CASHIER',
        cashierStores: {
          some: { ownerId: merchantId },
        },
      },
    });

    if (!staffUser) {
      throw new Error('Cashier not found in any of your stores or unauthorized');
    }

    // Connect cashier to the target store
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        cashiers: {
          connect: { id: staffId },
        },
      },
    });

    return {
      id: staffUser.id,
      fullName: staffUser.fullName,
      email: staffUser.email,
      phone: staffUser.phone,
      createdAt: staffUser.createdAt.toISOString(),
    };
  }

  async createStoreStaff(
    storeId: string,
    merchantId: string,
    data: { fullName: string; email: string; password?: string; phone?: string }
  ) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    // Validate phone number uniqueness if provided
    let normalizedPhone: string | null | undefined = undefined;
    if (data.phone) {
      const normalized = normalizePhone(data.phone);
      if (normalized) {
        const significantDigits = getPhoneSignificantDigits(normalized);
        const existingWithPhone = await this.prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalized },
              { phone: { endsWith: significantDigits } },
            ],
          },
          select: { id: true, email: true },
        });

        if (existingWithPhone && existingWithPhone.email !== data.email) {
          throw new Error('This phone number is already registered to another account.');
        }
        normalizedPhone = normalized;
      }
    }

    const serviceClient = getSupabaseServiceClient();
    let authUserId: string | null = null;
    const initialPassword = data.password || 'Cashier@123456';

    // 1. Try to create user in Supabase Auth
    try {
      const { data: authData, error: createError } = await serviceClient.auth.admin.createUser({
        email: data.email,
        password: initialPassword,
        email_confirm: true,
        user_metadata: {
          role: 'CASHIER',
          fullName: data.fullName,
          phone: data.phone || null,
        },
      });

      if (createError) {
        // If user already exists in Supabase, look them up
        const isAlreadyRegistered =
          createError.message?.toLowerCase().includes('already') ||
          createError.message?.toLowerCase().includes('exists');

        if (isAlreadyRegistered) {
          const existingDbUser = await this.prisma.user.findUnique({
            where: { email: data.email },
          });

          if (existingDbUser) {
            authUserId = existingDbUser.id;
            // Update password in Supabase if a specific password was provided
            if (data.password) {
              await serviceClient.auth.admin.updateUserById(authUserId, {
                password: data.password,
                user_metadata: { role: 'CASHIER', fullName: data.fullName },
              });
            }
          } else {
            // Search in Supabase users
            const { data: userList } = await serviceClient.auth.admin.listUsers();
            const users: any[] = (userList as any)?.users || [];
            const matched = users.find((u: any) => u.email === data.email);
            if (matched && matched.id) {
              const matchedId: string = String(matched.id);
              authUserId = matchedId;
              if (data.password) {
                await serviceClient.auth.admin.updateUserById(matchedId, {
                  password: data.password,
                  user_metadata: { role: 'CASHIER', fullName: data.fullName },
                });
              }
            } else {
              throw new Error(createError.message);
            }
          }
        } else {
          throw new Error(createError.message);
        }
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }
    } catch (err: any) {
      // If Supabase call failed with non-handled error
      if (!authUserId) {
        throw new Error(err.message || 'Failed to create auth user');
      }
    }

    if (!authUserId) {
      throw new Error('Failed to resolve user ID for cashier.');
    }

    // 2. Upsert in Prisma and link to this store
    const user = await this.prisma.user.upsert({
      where: { id: authUserId },
      update: {
        role: 'CASHIER',
        fullName: data.fullName,
        phone: normalizedPhone ?? undefined,
        cashierStores: {
          connect: { id: storeId },
        },
      },
      create: {
        id: authUserId,
        email: data.email,
        fullName: data.fullName,
        phone: normalizedPhone ?? undefined,
        role: 'CASHIER',
        cashierStores: {
          connect: { id: storeId },
        },
      },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateStoreStaff(
    storeId: string,
    merchantId: string,
    staffId: string,
    data: { fullName?: string; phone?: string }
  ) {
    // Verify ownership and membership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
      include: { cashiers: { where: { id: staffId } } },
    });

    if (!store || store.cashiers.length === 0) {
      throw new Error('Cashier not found in this store or unauthorized');
    }

    let normalizedPhone: string | null | undefined = undefined;
    if (data.phone !== undefined) {
      if (data.phone === null || data.phone.trim() === '') {
        normalizedPhone = null;
      } else {
        const normalized = normalizePhone(data.phone);
        if (normalized) {
          const significantDigits = getPhoneSignificantDigits(normalized);
          const existingWithPhone = await this.prisma.user.findFirst({
            where: {
              id: { not: staffId },
              OR: [
                { phone: normalized },
                { phone: { endsWith: significantDigits } },
              ],
            },
            select: { id: true },
          });

          if (existingWithPhone) {
            throw new Error('This phone number is already registered to another account.');
          }
          normalizedPhone = normalized;
        }
      }
    }

    // Update in Prisma
    const updatedUser = await this.prisma.user.update({
      where: { id: staffId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
      },
    });

    // Update in Supabase user metadata
    try {
      const serviceClient = getSupabaseServiceClient();
      await serviceClient.auth.admin.updateUserById(staffId, {
        user_metadata: {
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
        },
      });
    } catch (e) {
      // Ignore non-fatal metadata sync failure
    }

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt.toISOString(),
    };
  }

  async changeStoreStaffPassword(
    storeId: string,
    merchantId: string,
    staffId: string,
    newPassword: string
  ) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Verify ownership and membership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
      include: { cashiers: { where: { id: staffId } } },
    });

    if (!store || store.cashiers.length === 0) {
      throw new Error('Cashier not found in this store or unauthorized');
    }

    const serviceClient = getSupabaseServiceClient();
    const { error } = await serviceClient.auth.admin.updateUserById(staffId, {
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || 'Failed to update cashier password');
    }

    return { message: 'Password updated successfully' };
  }

  async deleteStoreStaff(storeId: string, merchantId: string, staffId: string) {
    // Verify ownership and membership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
      include: { cashiers: { where: { id: staffId } } },
    });

    if (!store || store.cashiers.length === 0) {
      throw new Error('Cashier not found in this store or unauthorized');
    }

    // Disconnect from store
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        cashiers: {
          disconnect: { id: staffId },
        },
      },
    });

    return { message: 'Cashier removed from store successfully' };
  }

  async getStoreAnalytics(storeId: string, merchantId: string) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    // 1. Total members count
    const totalMembersPromise = this.prisma.customerMembership.count({
      where: { storeId },
    });

    // 2. High-performance database aggregate grouping for points issued and redeemed
    const pointsTotalsPromise = this.prisma.transaction.groupBy({
      by: ['type'],
      where: { storeId },
      _sum: {
        pointsAffected: true,
      },
    });

    // 3. Fetch recent transactions for timeline chart (capped at last 100 transactions)
    const recentTxPromise = this.prisma.transaction.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        createdAt: true,
        type: true,
        pointsAffected: true,
      },
    });

    const [totalMembers, pointsTotals, recentTx] = await Promise.all([
      totalMembersPromise,
      pointsTotalsPromise,
      recentTxPromise,
    ]);

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;

    for (const item of pointsTotals) {
      if (item.type === 'earn') {
        totalPointsIssued = item._sum.pointsAffected || 0;
      } else if (item.type === 'redeem') {
        totalPointsRedeemed = Math.abs(item._sum.pointsAffected || 0);
      }
    }

    // Group recent transactions chronologically by day
    const dailyMap = new Map<string, { date: string; issued: number; redeemed: number }>();

    for (const t of recentTx) {
      const dateStr = t.createdAt.toISOString().split('T')[0] || '';
      const existing = dailyMap.get(dateStr) || { date: dateStr, issued: 0, redeemed: 0 };
      if (t.type === 'earn') {
        existing.issued += t.pointsAffected;
      } else if (t.type === 'redeem') {
        existing.redeemed += Math.abs(t.pointsAffected);
      }
      dailyMap.set(dateStr, existing);
    }

    const recentTransactions = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return {
      totalMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      recentTransactions,
    };
  }

  async getStoreRewards(storeId: string, merchantId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    return this.prisma.reward.findMany({
      where: { storeId },
      orderBy: { pointsCost: 'asc' },
    });
  }

  async createStoreReward(
    storeId: string,
    merchantId: string,
    data: { name: string; description?: string; pointsCost: number }
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    if (!data.name || data.pointsCost <= 0) {
      throw new Error('Reward name and a positive point cost are required.');
    }

    return this.prisma.reward.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        active: true,
      },
    });
  }

  async updateStoreReward(
    storeId: string,
    merchantId: string,
    rewardId: string,
    data: { name?: string; description?: string; pointsCost?: number; active?: boolean }
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const reward = await this.prisma.reward.findFirst({
      where: { id: rewardId, storeId },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    return this.prisma.reward.update({
      where: { id: rewardId },
      data,
    });
  }

  async deleteStoreReward(storeId: string, merchantId: string, rewardId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const reward = await this.prisma.reward.findFirst({
      where: { id: rewardId, storeId },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    await this.prisma.reward.delete({
      where: { id: rewardId },
    });

    return { message: 'Reward deleted successfully' };
  }

  async getStoreTransactions(
    storeId: string,
    merchantId: string,
    options?: {
      page?: number;
      limit?: number;
      cashierId?: string;
      type?: 'earn' | 'redeem';
      query?: string;
    }
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      storeId,
      ...(options?.cashierId ? { cashierId: options.cashierId } : {}),
      ...(options?.type ? { type: options.type } : {}),
    };

    if (options?.query && options.query.trim()) {
      const q = options.query.trim();
      where.membership = {
        customer: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        },
      };
    }

    const [total, transactions, sumStats] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          membership: {
            include: {
              customer: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
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
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: {
          pointsAffected: true,
          amountTnd: true,
        },
      }),
    ]);

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;
    let totalAmount = 0;

    sumStats.forEach((group: any) => {
      if (group.type === 'earn') {
        totalPointsIssued = group._sum.pointsAffected || 0;
        totalAmount += Number(group._sum.amountTnd || 0);
      } else if (group.type === 'redeem') {
        totalPointsRedeemed = group._sum.pointsAffected || 0;
      }
    });

    return {
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amountTnd: t.amountTnd ? Number(t.amountTnd) : null,
        pointsAffected: t.pointsAffected,
        createdAt: t.createdAt.toISOString(),
        customerName: t.membership?.customer?.fullName || t.membership?.customer?.email?.split('@')[0] || 'Customer',
        customerPhone: t.membership?.customer?.phone || null,
        cashierId: t.cashierId,
        cashierName: t.cashier?.fullName || t.cashier?.email?.split('@')[0] || 'Unknown Staff',
        cashierEmail: t.cashier?.email || '',
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalTransactions: total,
        totalPointsIssued,
        totalPointsRedeemed,
        totalAmount: Number(totalAmount.toFixed(3)),
      },
    };
  }
}
