import type { PrismaClient, Prisma } from '@repo/database';
import { HTTPException } from 'hono/http-exception';

const TND_TO_POINTS_RATIO = 10; // 1 TND = 10 Points

export class TransactionsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Issues points based on TND spent.
   */
  async issuePoints(customerId: string, storeId: string, cashierId: string, amountTnd: number) {
    if (amountTnd <= 0) {
      throw new HTTPException(400, { message: 'Amount must be greater than 0' });
    }

    const pointsToIssue = Math.floor(amountTnd * TND_TO_POINTS_RATIO);

    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Find customer membership for this store
      let membership = await tx.customerMembership.findUnique({
        where: {
          customerStoreIdx: {
            customerId,
            storeId,
          }
        }
      });

      if (!membership) {
        membership = await tx.customerMembership.create({
          data: {
            customerId,
            storeId,
            pointsBalance: 0,
            qrCodeToken: `${customerId}-${storeId}-${Date.now()}`
          }
        });
      }

      // Add points
      const updatedMembership = await tx.customerMembership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: membership.pointsBalance + pointsToIssue,
        }
      });

      // Log transaction
      const transaction = await tx.transaction.create({
        data: {
          storeId,
          cashierId,
          membershipId: membership.id,
          type: 'earn',
          amountTnd,
          pointsAffected: pointsToIssue,
        }
      });

      return {
        transaction,
        newBalance: updatedMembership.pointsBalance,
        pointsIssued: pointsToIssue
      };
    });
  }

  /**
   * Redeems a specific reward.
   */
  async redeemReward(customerId: string, storeId: string, cashierId: string, rewardId: string) {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });
      if (!reward || reward.storeId !== storeId) {
        throw new HTTPException(404, { message: 'Reward not found' });
      }

      const membership = await tx.customerMembership.findUnique({
        where: {
          customerStoreIdx: {
            customerId,
            storeId,
          }
        }
      });

      if (!membership || membership.pointsBalance < reward.pointsCost) {
        throw new HTTPException(400, { message: 'Insufficient points' });
      }

      // Deduct points
      const updatedMembership = await tx.customerMembership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: membership.pointsBalance - reward.pointsCost,
        }
      });

      // Log transaction
      const transaction = await tx.transaction.create({
        data: {
          storeId,
          cashierId,
          membershipId: membership.id,
          type: 'redeem',
          pointsAffected: -reward.pointsCost,
        }
      });

      // Create Voucher for the customer
      const voucher = await tx.voucher.create({
        data: {
          membershipId: membership.id,
          rewardId: reward.id,
          code: `VOUCHER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          status: 'active',
        }
      });

      return {
        transaction,
        voucher,
        newBalance: updatedMembership.pointsBalance,
      };
    });
  }
}
