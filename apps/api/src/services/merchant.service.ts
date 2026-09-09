import type { PrismaClient } from '@repo/database';
import { getSupabaseServiceClient } from '../lib/supabase.js';

export class MerchantService {
  constructor(private prisma: PrismaClient, private supabaseAdmin?: any) {}

  async getStores(merchantId: string) {
    return this.prisma.store.findMany({
      where: { ownerId: merchantId },
    });
  }

  async createStore(merchantId: string, data: { name: string; slug: string; primaryColor?: string; pointsPerTnd?: number }) {
    // Check if slug exists
    const existing = await this.prisma.store.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      throw new Error('Store with this slug already exists');
    }

    return this.prisma.store.create({
      data: {
        ownerId: merchantId,
        name: data.name,
        slug: data.slug,
        primaryColor: data.primaryColor || '#000000',
        pointsPerTnd: data.pointsPerTnd || 10,
      }
    });
  }

  async updateStore(storeId: string, merchantId: string, data: { name?: string; primaryColor?: string; pointsPerTnd?: number }) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data,
    });
  }

  async getStoreCustomers(storeId: string, merchantId: string) {
    // Verify ownership
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: merchantId },
    });

    if (!store) {
      throw new Error('Store not found or unauthorized');
    }

    const memberships = await this.prisma.customerMembership.findMany({
      where: { storeId },
      include: { customer: true },
      orderBy: { joinedAt: 'desc' },
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
        phone: data.phone ?? undefined,
        cashierStores: {
          connect: { id: storeId },
        },
      },
      create: {
        id: authUserId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone ?? undefined,
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

    // Update in Prisma
    const updatedUser = await this.prisma.user.update({
      where: { id: staffId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
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

    const totalMembers = await this.prisma.customerMembership.count({
      where: { storeId },
    });

    // In a real application, you might use Prisma aggregates for this, but to keep it simple:
    const transactions = await this.prisma.transaction.findMany({
      where: { storeId },
    });

    const totalPointsIssued = transactions
      .filter((t) => t.type === 'earn')
      .reduce((sum, t) => sum + t.pointsAffected, 0);

    const totalPointsRedeemed = transactions
      .filter((t) => t.type === 'redeem')
      .reduce((sum, t) => sum + Math.abs(t.pointsAffected), 0);

    // Basic recent transactions grouping by date (last 7 days could be calculated here)
    const recentTransactions = transactions.slice(-10).map((t) => ({
      date: t.createdAt.toISOString().split('T')[0],
      issued: t.type === 'earn' ? t.pointsAffected : 0,
      redeemed: t.type === 'redeem' ? Math.abs(t.pointsAffected) : 0,
    }));

    return {
      totalMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      recentTransactions,
    };
  }
}
