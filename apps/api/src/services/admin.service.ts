import type { PrismaClient } from '@repo/database'
import { UserRole } from '@repo/database'
import { getSupabaseServiceClient } from '../lib/supabase.js'

export class AdminService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Aggregates platform-wide metrics and KPIs.
   */
  async getPlatformMetrics() {
    const [
      totalUsers,
      totalMerchants,
      totalCashiers,
      totalCustomers,
      totalStores,
      totalTransactions,
      totalRewards,
      totalVouchers,
      totalQrReferrals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.MERCHANT } }),
      this.prisma.user.count({ where: { role: UserRole.CASHIER } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.store.count(),
      this.prisma.transaction.count(),
      this.prisma.reward.count({ where: { active: true } }),
      this.prisma.voucher.count(),
      this.prisma.user.count({ where: { referredByStoreId: { not: null } } }),
    ])

    const transactions = await this.prisma.transaction.findMany({
      select: {
        type: true,
        pointsAffected: true,
        amountTnd: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    const totalPointsIssued = transactions
      .filter((t) => t.type === 'earn')
      .reduce((sum, t) => sum + t.pointsAffected, 0)

    const totalPointsRedeemed = transactions
      .filter((t) => t.type === 'redeem')
      .reduce((sum, t) => sum + Math.abs(t.pointsAffected), 0)

    const totalVolumeTnd = transactions
      .filter((t) => t.amountTnd !== null)
      .reduce((sum, t) => sum + Number(t.amountTnd || 0), 0)

    // Calculate store customer acquisition breakdown
    const storesWithReferrals = await this.prisma.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        _count: {
          select: {
            referredUsers: true,
            memberships: true,
          },
        },
      },
      orderBy: {
        referredUsers: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    const storeAcquisitions = storesWithReferrals.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      primaryColor: s.primaryColor,
      referredUsersCount: s._count.referredUsers,
      totalMembersCount: s._count.memberships,
    }))

    // Calculate 14-day daily transaction volume trend
    const dailyVolumeMap = new Map<string, { date: string; issued: number; redeemed: number; volumeTnd: number }>()

    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0] || ''
      dailyVolumeMap.set(dateStr, { date: dateStr, issued: 0, redeemed: 0, volumeTnd: 0 })
    }

    transactions.forEach((t) => {
      const dateStr = t.createdAt.toISOString().split('T')[0] || ''
      if (dailyVolumeMap.has(dateStr)) {
        const item = dailyVolumeMap.get(dateStr)
        if (item) {
          if (t.type === 'earn') {
            item.issued += t.pointsAffected
            item.volumeTnd += Number(t.amountTnd || 0)
          } else if (t.type === 'redeem') {
            item.redeemed += Math.abs(t.pointsAffected)
          }
        }
      }
    })

    const dailyTrends = Array.from(dailyVolumeMap.values())

    return {
      kpis: {
        totalUsers,
        totalMerchants,
        totalCashiers,
        totalCustomers,
        totalStores,
        totalTransactions,
        totalRewards,
        totalVouchers,
        totalPointsIssued,
        totalPointsRedeemed,
        totalVolumeTnd,
        totalQrReferrals,
      },
      storeAcquisitions,
      dailyTrends,
    }
  }

  /**
   * Retrieves all registered stores with owner details and member counts.
   */
  async getAllStores() {
    const stores = await this.prisma.store.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            cashiers: true,
            memberships: true,
            rewards: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      primaryColor: s.primaryColor,
      pointsPerTnd: s.pointsPerTnd,
      createdAt: s.createdAt.toISOString(),
      owner: {
        id: s.owner.id,
        email: s.owner.email,
        fullName: s.owner.fullName,
      },
      stats: {
        cashiersCount: s._count.cashiers,
        membersCount: s._count.memberships,
        rewardsCount: s._count.rewards,
        transactionsCount: s._count.transactions,
      },
    }))
  }

  /**
   * Retrieves all users with filter options.
   */
  async getAllUsers(query?: string, role?: string) {
    const isRoleValid = role && Object.values(UserRole).includes(role as UserRole)
    const userRole = isRoleValid ? (role as UserRole) : undefined

    const users = await this.prisma.user.findMany({
      where: {
        ...(userRole ? { role: userRole } : {}),
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { fullName: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        stores: {
          select: { id: true, name: true, slug: true },
        },
        cashierStores: {
          select: { id: true, name: true, slug: true },
        },
        referredByStore: {
          select: { id: true, name: true, slug: true },
        },
        memberships: {
          select: {
            id: true,
            storeId: true,
            joinSource: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      stores: u.stores,
      cashierStores: u.cashierStores,
      referredByStore: u.referredByStore,
      memberships: u.memberships,
      membershipsCount: u._count.memberships,
    }))
  }

  /**
   * Updates a user's role in database and Supabase Auth.
   */
  async updateUserRole(userId: string, newRole: string) {
    const allowedRoles = Object.values(UserRole)
    if (!allowedRoles.includes(newRole as UserRole)) {
      throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`)
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as UserRole },
    })

    try {
      const serviceClient = getSupabaseServiceClient()
      await serviceClient.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole },
      })
    } catch {
      // Ignore non-fatal supabase metadata sync failure
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      message: `User role updated to ${newRole}`,
    }
  }

  /**
   * Retrieves global transactions log.
   */
  async getGlobalTransactions(take = 50) {
    const transactions = await this.prisma.transaction.findMany({
      include: {
        store: {
          select: { id: true, name: true, slug: true },
        },
        membership: {
          include: {
            customer: {
              select: { id: true, email: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    })

    return transactions.map((t) => ({
      id: t.id,
      storeId: t.storeId,
      storeName: t.store.name,
      storeSlug: t.store.slug,
      type: t.type,
      amountTnd: t.amountTnd ? Number(t.amountTnd) : null,
      pointsAffected: t.pointsAffected,
      createdAt: t.createdAt.toISOString(),
      customer: {
        id: t.membership.customer.id,
        email: t.membership.customer.email,
        fullName: t.membership.customer.fullName,
      },
    }))
  }
}
